import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let lastStatus = '';

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // closed
        }
      };

      const checkStatus = async () => {
        try {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { status: true, updatedAt: true },
          });
          if (order && order.status !== lastStatus) {
            lastStatus = order.status;
            send(JSON.stringify({ type: 'status_update', status: order.status, updatedAt: order.updatedAt }));
          }
        } catch {
          // ignore
        }
      };

      // Check immediately then poll every 5s
      checkStatus();
      const interval = setInterval(checkStatus, 5000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
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
