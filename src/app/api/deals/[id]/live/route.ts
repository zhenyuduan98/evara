import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Send initial state
        const deal = await prisma.deal.findUnique({
          where: { id: params.id },
          include: { product: { select: { title: true, price: true } } },
        });

        if (!deal) {
          sendEvent({ error: 'Deal not found' });
          controller.close();
          return;
        }

        sendEvent({
          id: deal.id,
          title: deal.product.title,
          discountPercent: deal.discountPercent,
          maxQuantity: deal.maxQuantity,
          claimedQuantity: deal.claimedQuantity,
          remaining: deal.maxQuantity - deal.claimedQuantity,
          endsAt: deal.endDate.toISOString(),
          isActive: new Date() < deal.endDate && deal.claimedQuantity < deal.maxQuantity,
        });

        // Poll every 2 seconds for updates
        const interval = setInterval(async () => {
          try {
            const updated = await prisma.deal.findUnique({
              where: { id: params.id },
            });

            if (!updated) {
              clearInterval(interval);
              controller.close();
              return;
            }

            const remaining = updated.maxQuantity - updated.claimedQuantity;
            const isActive = new Date() < updated.endDate && remaining > 0;

            sendEvent({
              claimedQuantity: updated.claimedQuantity,
              remaining,
              isActive,
              endsAt: updated.endDate.toISOString(),
            });

            if (!isActive) {
              clearInterval(interval);
              controller.close();
            }
          } catch {
            clearInterval(interval);
            controller.close();
          }
        }, 2000);

        // Clean up after 5 minutes max
        setTimeout(() => {
          clearInterval(interval);
          controller.close();
        }, 300000);
      } catch {
        controller.close();
      }
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
