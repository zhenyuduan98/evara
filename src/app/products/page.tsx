import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import FilterSidebar from '@/components/products/FilterSidebar';
import ProductGrid from '@/components/products/ProductGrid';
import SortBar from '@/components/products/SortBar';
import ActiveFilters from '@/components/products/ActiveFilters';
import type { Prisma } from '@prisma/client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our full catalog of products. Filter by category, price, rating and more.',
  openGraph: { title: 'Products - Evara', description: 'Browse our full catalog of products.' },
  twitter: { card: 'summary', title: 'Products - Evara' },
  alternates: { canonical: '/products' },
};

const PER_PAGE = 24;

interface PageProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    brands?: string;
    [key: string]: string | undefined;
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { q, category, sort, page, minPrice, maxPrice, rating, brands } = searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
  };

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
    if (minPrice) (where.price as Prisma.DecimalFilter).gte = Number(minPrice);
    if (maxPrice) (where.price as Prisma.DecimalFilter).lte = Number(maxPrice);
  }

  if (rating) {
    where.averageRating = { gte: Number(rating) };
  }

  if (brands) {
    where.brand = { in: brands.split(',').filter(Boolean) };
  }

  // Attribute-based filtering (params like attr_Color=Red,Blue)
  const attrFilters: { key: string; values: string[] }[] = [];
  for (const [paramKey, paramValue] of Object.entries(searchParams)) {
    if (paramKey.startsWith('attr_') && paramValue) {
      const attrKey = paramKey.slice(5);
      const attrValues = paramValue.split(',').filter(Boolean);
      if (attrValues.length > 0) {
        attrFilters.push({ key: attrKey, values: attrValues });
      }
    }
  }

  if (attrFilters.length > 0) {
    where.AND = attrFilters.map(af => ({
      attributes: {
        some: {
          key: af.key,
          value: { in: af.values },
        },
      },
    }));
  }

  // Sort
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  switch (sort) {
    case 'price_asc': orderBy = { price: 'asc' }; break;
    case 'price_desc': orderBy = { price: 'desc' }; break;
    case 'rating': orderBy = { averageRating: 'desc' }; break;
    case 'newest': orderBy = { createdAt: 'desc' }; break;
    default: orderBy = { reviewCount: 'desc' }; break;
  }

  const [products, totalCount, categories, brandList, filterableAttrs, sponsoredIds] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: { select: { stock: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { select: { id: true, name: true, slug: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    }),
    // Get filterable attributes with their distinct values
    prisma.productAttribute.findMany({
      where: { filterable: true },
      select: { key: true, value: true },
      distinct: ['key', 'value'],
      orderBy: [{ key: 'asc' }, { value: 'asc' }],
    }),
    prisma.sponsoredProduct.findMany({
      where: { isActive: true },
      select: { productId: true },
    }),
  ]);

  // Group attribute filters by key
  const attrFilterMap = new Map<string, string[]>();
  filterableAttrs.forEach(a => {
    if (!attrFilterMap.has(a.key)) attrFilterMap.set(a.key, []);
    attrFilterMap.get(a.key)!.push(a.value);
  });
  const attributeFilters = Array.from(attrFilterMap.entries()).map(([key, values]) => ({ key, values }));

  const sponsoredSet = new Set(sponsoredIds.map(s => s.productId));

  const serializedProducts = products.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    brand: p.brand,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    averageRating: p.averageRating,
    reviewCount: p.reviewCount,
    images: p.images.map(img => ({ url: img.url, alt: img.alt })),
    variants: p.variants,
    isSponsored: sponsoredSet.has(p.id),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <Suspense fallback={<div className="w-60 shrink-0" />}>
          <FilterSidebar
            categories={categories.map(c => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              children: c.children,
            }))}
            brands={brandList.map(b => b.brand)}
            attributeFilters={attributeFilters}
          />
        </Suspense>

        <div className="flex-1 min-w-0">
          <Suspense fallback={<div className="h-8" />}>
            <ActiveFilters />
          </Suspense>
          <Suspense fallback={<div className="h-8" />}>
            <SortBar totalResults={totalCount} query={q} />
          </Suspense>

          <ProductGrid products={serializedProducts} />

          {/* Pagination */}
          {totalCount > PER_PAGE && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.min(10, Math.ceil(totalCount / PER_PAGE)) }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`/products?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(category ? { category } : {}),
                    ...(sort ? { sort } : {}),
                    page: String(p),
                  }).toString()}`}
                  className={`px-3 py-1 rounded border text-sm ${
                    p === currentPage
                      ? 'bg-amazon-orange text-white border-amazon-orange'
                      : 'bg-white hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
