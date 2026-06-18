import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const lastEventId = req.headers.get('Last-Event-ID') || req.nextUrl.searchParams.get('lastEventId');

  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (id: string, event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Send missed messages if reconnecting
      if (lastEventId) {
        try {
          const missed = await prisma.chatMessage.findMany({
            where: {
              sessionId,
              createdAt: { gt: new Date(lastEventId) },
            },
            orderBy: { createdAt: 'asc' },
          });
          for (const msg of missed) {
            send(msg.createdAt.toISOString(), 'message', msg);
          }
        } catch {
          // ignore
        }
      }

      send(new Date().toISOString(), 'connected', { sessionId, reconnected: !!lastEventId });

      // Poll for new messages every 2 seconds
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        try {
          const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          });
          if (session?.status === 'CLOSED') {
            send(new Date().toISOString(), 'closed', { reason: 'session_closed' });
            closed = true;
            clearInterval(interval);
            controller.close();
          }
        } catch {
          // ignore polling errors
        }
      }, 2000);

      // Keep-alive ping every 15 seconds
      const pingInterval = setInterval(() => {
        if (closed) {
          clearInterval(pingInterval);
          return;
        }
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          closed = true;
          clearInterval(pingInterval);
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
