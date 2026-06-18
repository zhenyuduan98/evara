import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const sellerProductIds = await prisma.product.findMany({
      where: { sellerId: userId },
      select: { id: true },
    });
    const productIds = sellerProductIds.map((p) => p.id);

    const orders = await prisma.order.findMany({
      where: { items: { some: { productId: { in: productIds } } } },
      include: {
        items: {
          where: { productId: { in: productIds } },
          include: { product: { select: { title: true } } },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return successResponse({ orders });
  } catch (error) {
    console.error('Seller orders error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}
