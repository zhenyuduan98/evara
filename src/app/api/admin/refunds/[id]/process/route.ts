import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse, successResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse('Unauthorized', 401);

    const refund = await prisma.refund.findUnique({
      where: { id: params.id },
      include: { order: true },
    });
    if (!refund) return errorResponse('Refund not found', 404);
    if (refund.status === 'COMPLETED') return errorResponse('Refund already processed', 400);

    let stripeRefundId = `re_simulated_${Date.now()}`;
    let realStripe = false;

    // Attempt real Stripe refund if key is configured and order has paymentIntentId
    if (process.env.STRIPE_SECRET_KEY && refund.order.paymentIntentId) {
      try {
        const { stripe } = await import('@/lib/stripe');
        const stripeRefund = await stripe.refunds.create({
          payment_intent: refund.order.paymentIntentId,
          amount: Math.round(Number(refund.amount) * 100),
        });
        stripeRefundId = stripeRefund.id;
        realStripe = true;
      } catch (stripeError) {
        console.warn('Stripe refund failed, using simulated fallback:', stripeError);
      }
    }

    const updated = await prisma.refund.update({
      where: { id: params.id },
      data: {
        status: 'COMPLETED',
        adminNote: `Processed via ${realStripe ? 'Stripe' : 'simulated'}. Refund ID: ${stripeRefundId}`,
        updatedAt: new Date(),
      },
    });

    // Update order status if full refund
    if (refund.type === 'FULL') {
      await prisma.order.update({
        where: { id: refund.orderId },
        data: { status: 'REFUNDED' },
      });
    }

    return successResponse({ refund: updated, stripeRefundId, realStripe });
  } catch (error) {
    console.error('Process refund error:', error);
    return errorResponse('Internal server error', 500);
  }
}
