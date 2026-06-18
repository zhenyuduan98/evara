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
    const range = searchParams.get('range') || 'monthly';

    const productIds = (await prisma.product.findMany({
      where: { sellerId: userId },
      select: { id: true },
    })).map(p => p.id);

    const now = new Date();
    let startDate: Date;
    if (range === 'daily') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'weekly') {
      startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: { in: productIds },
        order: { createdAt: { gte: startDate } },
      },
      include: { order: { select: { createdAt: true, status: true } } },
    });

    const salesByDate: Record<string, { revenue: number; orders: Set<string>; units: number }> = {};
    for (const item of orderItems) {
      const d = item.order.createdAt;
      let key: string;
      if (range === 'daily') {
        key = d.toISOString().slice(0, 10);
      } else if (range === 'weekly') {
        const week = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
        key = `W${week}`;
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      if (!salesByDate[key]) salesByDate[key] = { revenue: 0, orders: new Set(), units: 0 };
      salesByDate[key].revenue += Number(item.price) * item.quantity;
      salesByDate[key].orders.add(item.orderId);
      salesByDate[key].units += item.quantity;
    }

    const trends = Object.entries(salesByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, data]) => ({
        period,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders.size,
        units: data.units,
      }));

    const totalOrders = new Set(orderItems.map(i => i.orderId)).size;
    const totalRevenue = orderItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const views = await prisma.viewHistory.count({
      where: { productId: { in: productIds }, viewedAt: { gte: startDate } },
    });

    return successResponse({
      trends,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalViews: views,
        conversionRate: views > 0 ? Math.round((totalOrders / views) * 10000) / 100 : 0,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}
