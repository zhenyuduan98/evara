import { Meilisearch as MeiliSearch } from 'meilisearch';
import prisma from '@/lib/prisma';

const globalForMeili = globalThis as unknown as { meili: MeiliSearch };

export const meili = globalForMeili.meili || new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || 'masterkey',
});

if (process.env.NODE_ENV !== 'production') globalForMeili.meili = meili;

export async function syncProductsToMeilisearch() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: {
      categories: { select: { id: true, name: true, slug: true } },
      images: { take: 1, orderBy: { position: 'asc' } },
    },
  });

  const documents = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    brand: p.brand,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    averageRating: p.averageRating ? Number(p.averageRating) : 0,
    reviewCount: p.reviewCount,
    categories: p.categories.map((c) => c.name),
    categorySlug: p.categories.map((c) => c.slug),
    image: p.images[0]?.url || null,
    createdAt: p.createdAt.getTime(),
  }));

  const index = meili.index('products');

  // Configure filterable/sortable attributes
  await index.updateSettings({
    filterableAttributes: ['categories', 'categorySlug', 'brand', 'price', 'averageRating'],
    sortableAttributes: ['price', 'averageRating', 'createdAt'],
    searchableAttributes: ['title', 'description', 'brand', 'categories'],
  });

  // Bulk index in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < documents.length; i += batchSize) {
    await index.addDocuments(documents.slice(i, i + batchSize));
  }

  return { indexed: documents.length };
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  brand?: string;
}

export async function searchProducts(
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  limit: number = 24
) {
  const filterParts: string[] = [];

  if (filters.category) {
    filterParts.push(`categorySlug = "${filters.category}"`);
  }
  if (filters.brand) {
    filterParts.push(`brand = "${filters.brand}"`);
  }
  if (filters.minPrice !== undefined) {
    filterParts.push(`price >= ${filters.minPrice}`);
  }
  if (filters.maxPrice !== undefined) {
    filterParts.push(`price <= ${filters.maxPrice}`);
  }
  if (filters.minRating !== undefined) {
    filterParts.push(`averageRating >= ${filters.minRating}`);
  }

  const result = await meili.index('products').search(query, {
    filter: filterParts.length > 0 ? filterParts.join(' AND ') : undefined,
    limit,
    offset: (page - 1) * limit,
    facets: ['categories', 'brand'],
  });

  return {
    hits: result.hits,
    total: result.estimatedTotalHits || 0,
    facets: result.facetDistribution || {},
    page,
    limit,
    processingTimeMs: result.processingTimeMs,
  };
}

export default meili;
