import prisma from '@/lib/prisma';

const PRODUCT_SELECT = {
  id: true,
  title: true,
  slug: true,
  price: true,
  averageRating: true,
  images: { orderBy: { position: 'asc' as const }, take: 1 },
};

function formatProduct(p: any) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: Number(p.price),
    averageRating: p.averageRating,
    image: p.images?.[0]?.url || null,
  };
}

export async function getSimilarProducts(productId: string, limit = 12) {
  // Item-based collaborative filtering: find users who bought this, get other products they bought
  const buyers = await prisma.userBehavior.findMany({
    where: { productId, action: 'PURCHASE' },
    select: { userId: true },
    take: 100,
  });
  const buyerIds = [...new Set(buyers.map(b => b.userId))];

  if (buyerIds.length === 0) {
    // Fallback: same category products
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categories: { select: { id: true } } },
    });
    const catIds = product?.categories.map(c => c.id) || [];
    if (catIds.length === 0) return [];
    const similar = await prisma.product.findMany({
      where: { id: { not: productId }, status: 'ACTIVE', categories: { some: { id: { in: catIds } } } },
      select: PRODUCT_SELECT,
      orderBy: { averageRating: 'desc' },
      take: limit,
    });
    return similar.map(formatProduct);
  }

  const otherPurchases = await prisma.userBehavior.findMany({
    where: { userId: { in: buyerIds }, action: 'PURCHASE', productId: { not: productId } },
    select: { productId: true },
  });

  // Rank by frequency
  const freq = new Map<string, number>();
  otherPurchases.forEach(p => freq.set(p.productId, (freq.get(p.productId) || 0) + 1));
  const topIds = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);

  if (topIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: topIds }, status: 'ACTIVE' },
    select: PRODUCT_SELECT,
  });

  // Preserve frequency order
  const prodMap = new Map(products.map(p => [p.id, p]));
  return topIds.filter(id => prodMap.has(id)).map(id => formatProduct(prodMap.get(id)!));
}

export async function getPersonalRecommendations(userId: string, limit = 12) {
  // Get user's behavior history
  const myBehaviors = await prisma.userBehavior.findMany({
    where: { userId },
    select: { productId: true, action: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const myProductIds = [...new Set(myBehaviors.map(b => b.productId))];
  if (myProductIds.length === 0) return [];

  // Find similar users who interacted with same products
  const similarUsers = await prisma.userBehavior.findMany({
    where: { productId: { in: myProductIds }, userId: { not: userId } },
    select: { userId: true },
    take: 200,
  });
  const similarUserIds = [...new Set(similarUsers.map(u => u.userId))].slice(0, 50);

  if (similarUserIds.length === 0) return [];

  // Get their top products that user hasn't seen
  const theirBehaviors = await prisma.userBehavior.findMany({
    where: {
      userId: { in: similarUserIds },
      action: { in: ['PURCHASE', 'CART'] },
      productId: { notIn: myProductIds },
    },
    select: { productId: true },
  });

  const freq = new Map<string, number>();
  theirBehaviors.forEach(b => freq.set(b.productId, (freq.get(b.productId) || 0) + 1));
  const topIds = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);

  if (topIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: topIds }, status: 'ACTIVE' },
    select: PRODUCT_SELECT,
  });

  const prodMap = new Map(products.map(p => [p.id, p]));
  return topIds.filter(id => prodMap.has(id)).map(id => formatProduct(prodMap.get(id)!));
}

export async function getBuyAgain(userId: string, limit = 12) {
  // Products the user purchased, ordered by last purchase
  const purchases = await prisma.userBehavior.findMany({
    where: { userId, action: 'PURCHASE' },
    orderBy: { createdAt: 'desc' },
    select: { productId: true, createdAt: true },
  });

  // Deduplicate keeping latest
  const seen = new Set<string>();
  const uniqueIds: string[] = [];
  for (const p of purchases) {
    if (!seen.has(p.productId)) {
      seen.add(p.productId);
      uniqueIds.push(p.productId);
    }
    if (uniqueIds.length >= limit) break;
  }

  if (uniqueIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds }, status: 'ACTIVE' },
    select: PRODUCT_SELECT,
  });

  const prodMap = new Map(products.map(p => [p.id, p]));
  return uniqueIds.filter(id => prodMap.has(id)).map(id => formatProduct(prodMap.get(id)!));
}

export async function getTrending(days = 7, limit = 12) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const behaviors = await prisma.userBehavior.findMany({
    where: {
      createdAt: { gte: since },
      action: { in: ['VIEW', 'PURCHASE'] },
    },
    select: { productId: true, action: true },
  });

  // Score: PURCHASE=3, VIEW=1
  const scores = new Map<string, number>();
  behaviors.forEach(b => {
    const w = b.action === 'PURCHASE' ? 3 : 1;
    scores.set(b.productId, (scores.get(b.productId) || 0) + w);
  });

  const topIds = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);

  if (topIds.length === 0) {
    // Fallback: recently created active products
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: PRODUCT_SELECT,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return products.map(formatProduct);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: topIds }, status: 'ACTIVE' },
    select: PRODUCT_SELECT,
  });

  const prodMap = new Map(products.map(p => [p.id, p]));
  return topIds.filter(id => prodMap.has(id)).map(id => formatProduct(prodMap.get(id)!));
}
