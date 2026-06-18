import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import { Prisma } from '@prisma/client';
import { cacheWrap } from '@/lib/redis';
import { searchProducts } from '@/lib/meilisearch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100);
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const brand = searchParams.get('brand');

    // Use Meilisearch for text queries
    if (q) {
      try {
        const page = parseInt(searchParams.get('page') || '1');
        const cacheKey = `search:${q}:${category}:${brand}:${minPrice}:${maxPrice}:${sort}:${page}:${limit}`;
        const result = await cacheWrap(cacheKey, 300, () =>
          searchProducts(q, {
            category: category || undefined,
            brand: brand || undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          }, page, limit)
        );
        return successResponse(result);
      } catch {
        // Fall through to Prisma if Meilisearch unavailable
      }
    }

    // Build cache key from all params
    const cacheKey = `products:${cursor}:${limit}:${category}:${q}:${sort}:${minPrice}:${maxPrice}:${brand}`;
    const data = await cacheWrap(cacheKey, 300, async () => {
      const where: Prisma.ProductWhereInput = { status: 'ACTIVE' };

      if (category) {
        where.categories = { some: { slug: category } };
      }
      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
        ];
      }
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = new Prisma.Decimal(minPrice);
        if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice);
      }
      if (brand) {
        where.brand = { equals: brand, mode: 'insensitive' };
      }

      let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
      switch (sort) {
        case 'price_asc': orderBy = { price: 'asc' }; break;
        case 'price_desc': orderBy = { price: 'desc' }; break;
        case 'rating': orderBy = { averageRating: 'desc' }; break;
        case 'newest': orderBy = { createdAt: 'desc' }; break;
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          take: limit + 1,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          include: {
            images: { take: 1, orderBy: { position: 'asc' } },
            categories: { select: { id: true, name: true, slug: true } },
            _count: { select: { variants: true } },
          },
        }),
        prisma.product.count({ where }),
      ]);

      let nextCursor: string | null = null;
      if (products.length > limit) {
        const next = products.pop();
        nextCursor = next!.id;
      }

      return { products, nextCursor, total };
    });

    return successResponse(data);
  } catch (error) {
    console.error('Products GET error:', error);
    return errorResponse('Failed to fetch products', 500);
  }
}
