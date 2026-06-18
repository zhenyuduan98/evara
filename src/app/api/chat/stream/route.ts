import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  const encoder = new TextEncoder();
  let lastCheck = new Date();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial messages
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
      });
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'init', messages })}\n\n`));
      if (messages.length > 0) {
        lastCheck = messages[messages.length - 1].createdAt;
      }

      const interval = setInterval(async () => {
        try {
          const newMessages = await prisma.chatMessage.findMany({
            where: { sessionId, createdAt: { gt: lastCheck } },
            orderBy: { createdAt: 'asc' },
          });
          if (newMessages.length > 0) {
            lastCheck = newMessages[newMessages.length - 1].createdAt;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'messages', messages: newMessages })}\n\n`));
          }

          const chatSession = await prisma.chatSession.findUnique({ where: { id: sessionId } });
          if (chatSession?.status === 'CLOSED') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'closed' })}\n\n`));
            clearInterval(interval);
            controller.close();
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
