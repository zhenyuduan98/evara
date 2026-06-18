import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse, successResponse } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse('Forbidden', 403);

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const status = req.nextUrl.searchParams.get('status');
    const skip = (page - 1) * limit;

    const where = status ? { status: status as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin orders error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse('Forbidden', 403);

    const { orderId, status } = await req.json();

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) return errorResponse('Invalid status');

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return successResponse({ order });
  } catch (error) {
    console.error('Admin update order error:', error);
    return errorResponse('Internal server error', 500);
  }
}
