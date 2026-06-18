import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse, successResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse('Unauthorized', 401);

    const seller = await prisma.seller.findUnique({ where: { id: params.id } });
    if (!seller) return errorResponse('Seller not found', 404);

    // Calculate available balance
    const transactions = await prisma.sellerTransaction.findMany({
      where: { sellerId: seller.id, status: 'AVAILABLE' },
    });

    const availableAmount = transactions.reduce((s, t) => s + Number(t.net), 0);
    if (availableAmount <= 0) return errorResponse('No available balance for payout', 400);

    let stripePayoutId = `po_simulated_${Date.now()}`;
    let realStripe = false;

    // Attempt real Stripe Connect transfer
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const { stripe } = await import('@/lib/stripe');
        // Use Stripe Connect transfer to seller's connected account
        const sellerUser = await prisma.user.findUnique({ where: { id: seller.userId } });
        const stripeAccountId = (sellerUser as Record<string, unknown>)?.stripeConnectAccountId as string | undefined;

        if (stripeAccountId) {
          const transfer = await stripe.transfers.create({
            amount: Math.round(availableAmount * 100),
            currency: 'usd',
            destination: stripeAccountId,
            description: `Payout for seller ${seller.companyName}`,
          });
          stripePayoutId = transfer.id;
          realStripe = true;
        }
      } catch (stripeError) {
        console.warn('Stripe Connect transfer failed, using simulated fallback:', stripeError);
      }
    }

    const payout = await prisma.payoutBatch.create({
      data: {
        sellerId: seller.id,
        amount: availableAmount,
        status: 'COMPLETED',
        stripePayoutId,
        processedAt: new Date(),
      },
    });

    // Mark transactions as paid
    await prisma.sellerTransaction.updateMany({
      where: { sellerId: seller.id, status: 'AVAILABLE' },
      data: { status: 'PAID', paidAt: new Date() },
    });

    return successResponse({ payout, stripePayoutId, realStripe }, 201);
  } catch (error) {
    console.error('Seller payout error:', error);
    return errorResponse('Internal server error', 500);
  }
}
