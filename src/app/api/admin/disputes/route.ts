import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse('Unauthorized', 401);

    const url = req.nextUrl.searchParams;
    const status = url.get('status');
    const page = parseInt(url.get('page') || '1');
    const limit = parseInt(url.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: { order: { select: { orderNumber: true, total: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dispute.count({ where }),
    ]);

    return successResponse({ disputes, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Disputes error:', error);
    return errorResponse('Internal server error', 500);
  }
}
