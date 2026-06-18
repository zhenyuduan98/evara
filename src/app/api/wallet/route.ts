import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });

    return successResponse({
      balance: wallet ? Number(wallet.balance) : 0,
      currency: wallet?.currency || 'USD',
      transactions: wallet?.transactions || [],
    });
  } catch (error) {
    console.error('Wallet error:', error);
    return errorResponse('Internal server error', 500);
  }
}
