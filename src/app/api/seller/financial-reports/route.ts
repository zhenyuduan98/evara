import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const transactions = await prisma.sellerTransaction.findMany({
      where: {
        sellerId: seller.id,
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i).toLocaleString('en', { month: 'long' }),
      revenue: 0,
      commission: 0,
      net: 0,
      transactionCount: 0,
    }));

    for (const t of transactions) {
      const m = t.createdAt.getMonth();
      monthly[m].revenue += Number(t.amount);
      monthly[m].commission += Number(t.commission);
      monthly[m].net += Number(t.net);
      monthly[m].transactionCount++;
    }

    // Round values
    for (const m of monthly) {
      m.revenue = Math.round(m.revenue * 100) / 100;
      m.commission = Math.round(m.commission * 100) / 100;
      m.net = Math.round(m.net * 100) / 100;
    }

    const totals = {
      revenue: monthly.reduce((s, m) => s + m.revenue, 0),
      commission: monthly.reduce((s, m) => s + m.commission, 0),
      net: monthly.reduce((s, m) => s + m.net, 0),
      transactions: transactions.length,
    };

    return successResponse({ year, monthly, totals });
  } catch (error) {
    console.error('Financial reports error:', error);
    return errorResponse('Internal server error', 500);
  }
}
