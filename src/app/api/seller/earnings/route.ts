import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = { sellerId: seller.id };
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
    }

    const transactions = await prisma.sellerTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const totalEarnings = transactions.reduce((s, t) => s + Number(t.net), 0);
    const totalCommission = transactions.reduce((s, t) => s + Number(t.commission), 0);
    const pendingBalance = transactions
      .filter((t) => t.status === 'PENDING')
      .reduce((s, t) => s + Number(t.net), 0);
    const availableBalance = transactions
      .filter((t) => t.status === 'AVAILABLE')
      .reduce((s, t) => s + Number(t.net), 0);
    const paidTotal = transactions
      .filter((t) => t.status === 'PAID')
      .reduce((s, t) => s + Number(t.net), 0);

    return successResponse({
      totalEarnings,
      totalCommission,
      pendingBalance,
      availableBalance,
      paidTotal,
      commissionRate: 0.15,
      transactions,
    });
  } catch (error) {
    console.error('Seller earnings error:', error);
    return errorResponse('Failed to fetch earnings', 500);
  }
}
