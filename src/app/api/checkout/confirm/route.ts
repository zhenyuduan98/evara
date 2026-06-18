import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const { paymentIntentId, shippingAddressId, shippingMethod } = await req.json();

    // Verify address
    const address = await prisma.address.findFirst({
      where: { id: shippingAddressId, userId: user.id },
    });
    if (!address) return errorResponse('Invalid shipping address');

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          where: { savedForLater: false },
          include: {
            product: { include: { images: { take: 1, orderBy: { position: 'asc' } } } },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) return errorResponse('Cart is empty');

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant?.price ?? item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);

    const shippingCosts: Record<string, number> = { standard: 5.99, express: 12.99, nextday: 19.99 };
    const shippingCost = shippingCosts[shippingMethod] ?? 5.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

    // Create order and clear cart in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user.id,
          status: 'CONFIRMED',
          subtotal,
          shippingCost,
          tax,
          total,
          shippingAddressId,
          shippingMethod,
          paymentIntentId,
          paidAt: new Date(),
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.product.title,
              price: Number(item.variant?.price ?? item.product.price),
              quantity: item.quantity,
              imageUrl: item.product.images[0]?.url ?? null,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of cart.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id, savedForLater: false },
      });

      return newOrder;
    });

    // Send order confirmation email
    try {
      const { sendOrderConfirmationEmail } = await import('@/lib/email');
      await sendOrderConfirmationEmail(
        session.user.email,
        order.orderNumber,
        Number(order.total),
        order.items.length,
      );
    } catch (emailError) {
      console.error('Failed to queue order confirmation email:', emailError);
    }

    return successResponse({ order });
  } catch (error) {
    console.error('Confirm error:', error);
    return errorResponse('Internal server error', 500);
  }
}
