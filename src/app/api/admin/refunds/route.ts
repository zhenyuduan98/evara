import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse, successResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);

    const refunds = await prisma.refund.findMany({
      include: {
        order: { select: { id: true, orderNumber: true, total: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ refunds });
  } catch (error) {
    console.error('Admin refunds error:', error);
    return errorResponse('Internal server error', 500);
  }
}
