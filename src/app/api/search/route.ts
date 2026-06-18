import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const brand = searchParams.get('brand');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { status: 'ACTIVE' };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categories = { some: { slug: category } };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { position: 'asc' } },
          categories: { select: { id: true, name: true, slug: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Build facets from all matching products (without pagination)
    const facetWhere = { ...where };
    delete facetWhere.brand;
    delete facetWhere.price;

    const allMatching = await prisma.product.findMany({
      where: facetWhere,
      select: {
        brand: true,
        price: true,
        categories: { select: { id: true, name: true, slug: true } },
      },
    });

    const brandsSet = new Set(allMatching.map((p) => p.brand));
    const categoriesMap = new Map<string, { id: string; name: string; slug: string }>();
    allMatching.forEach((p) =>
      p.categories.forEach((c) => categoriesMap.set(c.id, c))
    );
    const prices = allMatching.map((p) => Number(p.price));
    const priceRange = prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 };

    return successResponse({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      facets: {
        brands: Array.from(brandsSet).sort(),
        categories: Array.from(categoriesMap.values()),
        priceRange,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return errorResponse('Search failed', 500);
  }
}
