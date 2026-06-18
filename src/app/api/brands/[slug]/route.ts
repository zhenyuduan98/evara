import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-helpers';
import { cacheWrap } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const cacheKey = `brand:${params.slug}:${page}:${limit}`;

    const data = await cacheWrap(cacheKey, 300, async () => {
      const brand = await prisma.brand.findUnique({
        where: { slug: params.slug },
      });
      if (!brand) return null;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { brandId: brand.id, status: 'ACTIVE' },
          include: { images: { take: 1, orderBy: { position: 'asc' } } },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where: { brandId: brand.id, status: 'ACTIVE' } }),
      ]);

      return {
        brand,
        products,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    });

    if (!data) return errorResponse('Brand not found', 404);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Brand page error:', error);
    return errorResponse('Internal server error', 500);
  }
}
