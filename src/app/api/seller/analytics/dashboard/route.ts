import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const products = await prisma.product.findMany({
      where: { sellerId: userId },
      select: { id: true, title: true, price: true, status: true },
    });
    const productIds = products.map(p => p.id);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: { order: { select: { createdAt: true, status: true } } },
    });

    const recentItems = orderItems.filter(i => i.order.createdAt >= thirtyDaysAgo);
    const totalRevenue = orderItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const monthlyRevenue = recentItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const totalOrders = new Set(orderItems.map(i => i.orderId)).size;
    const monthlyOrders = new Set(recentItems.map(i => i.orderId)).size;

    // Top products by revenue
    const productRevenue: Record<string, { title: string; revenue: number; units: number }> = {};
    orderItems.forEach(item => {
      if (!productRevenue[item.productId]) {
        const prod = products.find(p => p.id === item.productId);
        productRevenue[item.productId] = { title: prod?.title || 'Unknown', revenue: 0, units: 0 };
      }
      productRevenue[item.productId].revenue += Number(item.price) * item.quantity;
      productRevenue[item.productId].units += item.quantity;
    });
    const topProducts = Object.entries(productRevenue)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Monthly sales trend (last 6 months)
    const monthlySales: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthItems = orderItems.filter(item => item.order.createdAt >= start && item.order.createdAt < end);
      monthlySales.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: monthItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
        orders: new Set(monthItems.map(i => i.orderId)).size,
      });
    }

    // Conversion rate estimate (views vs orders)
    const viewCount = await prisma.viewHistory.count({
      where: { productId: { in: productIds }, viewedAt: { gte: thirtyDaysAgo } },
    });
    const conversionRate = viewCount > 0 ? (monthlyOrders / viewCount) * 100 : 0;

    return successResponse({
      totalRevenue,
      monthlyRevenue,
      totalOrders,
      monthlyOrders,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.status === 'ACTIVE').length,
      topProducts,
      monthlySales,
      conversionRate: Math.round(conversionRate * 100) / 100,
      trafficStats: { views: viewCount, period: '30d' },
      sellerRating: seller.rating,
    });
  } catch (error) {
    return errorResponse('Failed to fetch analytics', 500);
  }
}
