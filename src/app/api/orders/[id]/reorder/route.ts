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

    // Get or create cart
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    // Add each order item to cart
    let addedCount = 0;
    for (const item of order.items) {
      try {
        await prisma.cartItem.upsert({
          where: {
            cartId_productId_variantId: {
              cartId: cart.id,
              productId: item.productId,
              variantId: item.variantId || '',
            },
          },
          create: {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
          update: {
            quantity: { increment: item.quantity },
          },
        });
        addedCount++;
      } catch {
        // Product may no longer exist, skip
      }
    }

    return successResponse({ message: `${addedCount} item(s) added to cart`, addedCount });
  } catch (error) {
    console.error('Reorder error:', error);
    return errorResponse('Internal server error', 500);
  }
}
