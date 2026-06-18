import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const streamId = params.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastId = '';

      const sendComments = async () => {
        try {
          const where: Record<string, unknown> = { streamId };
          if (lastId) {
            where.id = { gt: lastId };
          }

          const comments = await prisma.liveComment.findMany({
            where,
            include: { user: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: 'asc' },
            take: 20,
          });

          if (comments.length > 0) {
            lastId = comments[comments.length - 1].id;
            const data = JSON.stringify(comments);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } else {
            controller.enqueue(encoder.encode(`: keepalive\n\n`));
          }
        } catch {
          // stream may have been closed
        }
      };

      await sendComments();
      const interval = setInterval(sendComments, 2000);

      request.signal.addEventListener('abort', () => {
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
