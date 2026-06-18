import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let performance = await prisma.sellerPerformance.findUnique({
      where: { sellerId_period: { sellerId: seller.id, period: currentPeriod } },
    });

    if (!performance) {
      // Generate metrics from order data
      const productIds = (await prisma.product.findMany({
        where: { sellerId: userId },
        select: { id: true },
      })).map(p => p.id);

      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentOrders = await prisma.orderItem.findMany({
        where: {
          productId: { in: productIds },
          order: { createdAt: { gte: thirtyDaysAgo } },
        },
        include: { order: { select: { status: true } } },
      });

      const totalOrders = new Set(recentOrders.map(i => i.orderId)).size;
      const cancelledOrders = new Set(
        recentOrders.filter(i => i.order.status === 'CANCELLED').map(i => i.orderId)
      ).size;

      const cancellationRate = totalOrders > 0 ? cancelledOrders / totalOrders : 0;
      const orderDefectRate = Math.random() * 0.02; // Simulated
      const lateShipRate = Math.random() * 0.05;
      const responseTime = 2 + Math.random() * 22; // hours
      const score = Math.max(0, 100 - orderDefectRate * 500 - lateShipRate * 200 - cancellationRate * 300);

      performance = await prisma.sellerPerformance.create({
        data: {
          sellerId: seller.id,
          period: currentPeriod,
          orderDefectRate: Math.round(orderDefectRate * 10000) / 10000,
          lateShipRate: Math.round(lateShipRate * 10000) / 10000,
          cancellationRate: Math.round(cancellationRate * 10000) / 10000,
          responseTime: Math.round(responseTime * 100) / 100,
          score: Math.round(score * 100) / 100,
        },
      });
    }

    const history = await prisma.sellerPerformance.findMany({
      where: { sellerId: seller.id },
      orderBy: { period: 'desc' },
      take: 12,
    });

    return successResponse({ current: performance, history });
  } catch (error) {
    console.error('Performance error:', error);
    return errorResponse('Failed to fetch performance', 500);
  }
}
