import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const { code } = await req.json();
    if (!code) return errorResponse('Gift card code is required');

    const giftCard = await prisma.giftCard.findUnique({ where: { code } });
    if (!giftCard) return errorResponse('Invalid gift card code', 404);
    if (!giftCard.isActive) return errorResponse('Gift card is no longer active');
    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) return errorResponse('Gift card has expired');
    if (Number(giftCard.balance) <= 0) return errorResponse('Gift card has no remaining balance');

    const amount = Number(giftCard.balance);

    await prisma.$transaction(async (tx) => {
      // Deactivate gift card
      await tx.giftCard.update({
        where: { id: giftCard.id },
        data: { isActive: false, balance: 0, userId: user.id },
      });

      // Upsert wallet
      const wallet = await tx.wallet.upsert({
        where: { userId: user.id },
        create: { userId: user.id, balance: amount },
        update: { balance: { increment: amount } },
      });

      // Record transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'CREDIT',
          description: `Gift card redeemed: ${code}`,
        },
      });
    });

    return successResponse({ message: 'Gift card redeemed successfully', amount });
  } catch (error) {
    console.error('Gift card redeem error:', error);
    return errorResponse('Internal server error', 500);
  }
}
