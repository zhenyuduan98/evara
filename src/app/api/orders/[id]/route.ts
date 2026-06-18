import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

export async function GET(
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
      include: { items: true, shippingAddress: true, refunds: true },
    });

    if (!order) return errorResponse('Order not found', 404);
    return successResponse({ order });
  } catch (error) {
    console.error('Order detail error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const { action } = await req.json();

    if (action === 'cancel') {
      const order = await prisma.order.findFirst({
        where: { id: params.id, userId: user.id },
      });

      if (!order) return errorResponse('Order not found', 404);
      if (['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
        return errorResponse('Cannot cancel this order');
      }

      const updated = await prisma.order.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      });

      return successResponse({ order: updated });
    }

    return errorResponse('Invalid action');
  } catch (error) {
    console.error('Order action error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
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
    });

    if (!order) return errorResponse('Order not found', 404);
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return errorResponse('Order can only be modified before shipping');
    }

    const { shippingAddressId, shippingMethod } = await req.json();

    const updateData: Record<string, unknown> = {};
    if (shippingAddressId) updateData.shippingAddressId = shippingAddressId;
    if (shippingMethod) updateData.shippingMethod = shippingMethod;

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: { items: true, shippingAddress: true },
    });

    return successResponse({ order: updated });
  } catch (error) {
    console.error('Order modify error:', error);
    return errorResponse('Internal server error', 500);
  }
}
