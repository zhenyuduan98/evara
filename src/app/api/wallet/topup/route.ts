import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const { amount } = await req.json();
    if (!amount || amount <= 0) return errorResponse('Invalid amount');

    const wallet = await prisma.wallet.upsert({
      where: { userId: user.id },
      create: { userId: user.id, balance: amount },
      update: { balance: { increment: amount } },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'CREDIT',
        description: `Top up: $${Number(amount).toFixed(2)}`,
      },
    });

    return successResponse({ balance: Number(wallet.balance) + amount, message: 'Wallet topped up' });
  } catch (error) {
    console.error('Wallet topup error:', error);
    return errorResponse('Internal server error', 500);
  }
}
