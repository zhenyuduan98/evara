import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!order) return errorResponse('Order not found', 404);

    if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
      return errorResponse('Cannot refund this order');
    }

    const { reason, type, amount } = await req.json();

    if (!reason || !type) return errorResponse('Reason and type are required');

    const refundAmount = type === 'FULL' ? Number(order.total) : Number(amount);
    if (refundAmount <= 0 || refundAmount > Number(order.total)) {
      return errorResponse('Invalid refund amount');
    }

    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        userId: user.id,
        reason,
        type,
        amount: refundAmount,
      },
    });

    return successResponse({ refund }, 201);
  } catch (error) {
    console.error('Refund error:', error);
    return errorResponse('Internal server error', 500);
  }
}
