import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse, successResponse } from '@/lib/api-helpers';

export async function PATCH(req: NextRequest, { params }: { params: { refundId: string } }) {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);

    const { status, adminNote } = await req.json();

    const refund = await prisma.refund.update({
      where: { id: params.id },
      data: { status, adminNote },
      include: {
        order: { select: { id: true, orderNumber: true, total: true } },
        user: { select: { name: true, email: true } },
      },
    });

    // If completed, update order status
    if (status === 'COMPLETED') {
      await prisma.order.update({
        where: { id: refund.orderId },
        data: { status: 'REFUNDED' },
      });
    }

    return successResponse({ refund });
  } catch (error) {
    console.error('Admin refund update error:', error);
    return errorResponse('Internal server error', 500);
  }
}
