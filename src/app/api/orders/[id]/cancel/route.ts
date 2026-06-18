import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: user.id },
      include: { items: true },
    });

    if (!order) return errorResponse('Order not found', 404);
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return errorResponse('Only PENDING or CONFIRMED orders can be cancelled');
    }

    // Restore stock for each item
    for (const item of order.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
        await prisma.inventoryLog.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            type: 'RELEASE',
            quantity: item.quantity,
            note: `Order ${order.orderNumber} cancelled`,
          },
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
      include: { items: true, shippingAddress: true },
    });

    return successResponse({ order: updated });
  } catch (error) {
    console.error('Order cancel error:', error);
    return errorResponse('Internal server error', 500);
  }
}
