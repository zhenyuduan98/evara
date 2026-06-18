import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q || q.length < 2) {
      return successResponse({ suggestions: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        title: { contains: q, mode: 'insensitive' },
      },
      select: { title: true, slug: true },
      take: 5,
      orderBy: { reviewCount: 'desc' },
    });

    return successResponse({
      suggestions: products.map((p) => ({ title: p.title, slug: p.slug })),
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    return errorResponse('Failed to get suggestions', 500);
  }
}
