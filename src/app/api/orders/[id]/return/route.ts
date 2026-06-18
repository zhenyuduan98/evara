import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return errorResponse('Order not found', 404);
    if (order.userId !== userId) return errorResponse('Unauthorized', 403);
    if (!['DELIVERED', 'SHIPPED'].includes(order.status)) {
      return errorResponse('Order is not eligible for return');
    }

    const { items, reason, description } = await request.json();
    if (!items || !reason) return errorResponse('Items and reason are required');

    const existing = await prisma.returnRequest.findFirst({ where: { orderId, userId, status: { in: ['PENDING', 'APPROVED'] } } });
    if (existing) return errorResponse('A return request already exists for this order');

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        userId,
        items: items,
        reason,
        adminNote: description || null,
      },
    });

    return successResponse(returnRequest, 201);
  } catch (error) {
    console.error('Return request error:', error);
    return errorResponse('Failed to create return request', 500);
  }
}
