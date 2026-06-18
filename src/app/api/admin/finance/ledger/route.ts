import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse('Unauthorized', 401);

    const url = req.nextUrl.searchParams;
    const account = url.get('account');
    const type = url.get('type');
    const orderId = url.get('orderId');
    const sellerId = url.get('sellerId');
    const page = parseInt(url.get('page') || '1');
    const limit = parseInt(url.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (account) where.account = account;
    if (type) where.type = type;
    if (orderId) where.orderId = orderId;
    if (sellerId) where.sellerId = sellerId;

    const [entries, total] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ledgerEntry.count({ where }),
    ]);

    return successResponse({ entries, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Ledger error:', error);
    return errorResponse('Internal server error', 500);
  }
}
