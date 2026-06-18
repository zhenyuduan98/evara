import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const { orderId, trackingNumber } = await request.json();
    if (!orderId) return errorResponse('orderId required', 400);

    // Verify this order has seller's products
    const sellerProducts = await prisma.product.findMany({ where: { sellerId: userId }, select: { id: true } });
    const productIds = sellerProducts.map(p => p.id);
    const orderItem = await prisma.orderItem.findFirst({ where: { orderId, productId: { in: productIds } } });
    if (!orderItem) return errorResponse('Order not found', 404);

    await prisma.order.update({ where: { id: orderId }, data: { status: 'SHIPPED' } });

    // Create or update shipment
    const existingShipment = await prisma.shipment.findFirst({ where: { orderId } });
    if (existingShipment) {
      await prisma.shipment.update({
        where: { id: existingShipment.id },
        data: {
          trackingNumber: trackingNumber || existingShipment.trackingNumber,
          status: 'SHIPPED',
          shippedAt: new Date(),
        },
      });
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('Ship order error:', error);
    return errorResponse('Failed to ship order', 500);
  }
}
