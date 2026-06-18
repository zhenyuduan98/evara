import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Admin access required', 403);

    const rates = await prisma.commissionRate.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse({ rates });
  } catch (error) {
    console.error('Commission list error:', error);
    return errorResponse('Failed to list commissions', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Admin access required', 403);

    const { categoryId, sellerId, rate, type } = await request.json();
    if (rate === undefined) return errorResponse('rate is required');

    const commission = await prisma.commissionRate.create({
      data: {
        categoryId: categoryId || null,
        sellerId: sellerId || null,
        rate,
        type: type || 'PERCENTAGE',
      },
    });
    return successResponse({ commission }, 201);
  } catch (error) {
    console.error('Commission create error:', error);
    return errorResponse('Failed to create commission rate', 500);
  }
}
