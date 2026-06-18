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
    const productIds = products.map((p) => p.id);

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: { order: { select: { createdAt: true, status: true } } },
    });

    const totalRevenue = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const totalOrders = new Set(orderItems.map((i) => i.orderId)).size;
    const totalUnitsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    // Monthly revenue (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlySales: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthItems = orderItems.filter((item) => {
        const created = new Date(item.order.createdAt);
        return created >= d && created <= monthEnd;
      });
      monthlySales.push({
        month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: monthItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
        orders: new Set(monthItems.map((i) => i.orderId)).size,
      });
    }

    // Top products by revenue
    const productRevenue: Record<string, { title: string; revenue: number; units: number }> = {};
    for (const item of orderItems) {
      const pid = item.productId;
      if (!productRevenue[pid]) {
        const prod = products.find(p => p.id === pid);
        productRevenue[pid] = { title: prod?.title || 'Unknown', revenue: 0, units: 0 };
      }
      productRevenue[pid].revenue += Number(item.price) * item.quantity;
      productRevenue[pid].units += item.quantity;
    }
    const topProducts = Object.entries(productRevenue)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Seller reviews
    const sellerReviews = await prisma.sellerReview.findMany({ where: { sellerId: seller.id } });
    const reviewCount = sellerReviews.length;
    const performanceScore = Math.min(100, Math.round(
      (seller.rating / 5) * 40 + Math.min(reviewCount, 50) / 50 * 30 + Math.min(totalUnitsSold, 100) / 100 * 30
    ));

    return successResponse({
      totalProducts,
      activeProducts,
      totalRevenue,
      totalOrders,
      totalUnitsSold,
      monthlySales,
      topProducts,
      performanceScore,
      reviewCount,
      sellerStatus: seller.status,
      sellerRating: seller.rating,
    });
  } catch (error) {
    console.error('Seller dashboard error:', error);
    return errorResponse('Failed to fetch dashboard', 500);
  }
}
