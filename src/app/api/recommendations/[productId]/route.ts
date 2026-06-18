import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const productId = params.productId;

  try {
    // Find products that were ordered together with this product
    const orderItems = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      take: 50,
    });

    const orderIds = orderItems.map(oi => oi.orderId);

    const alsoBought = orderIds.length > 0
      ? await prisma.orderItem.findMany({
          where: {
            orderId: { in: orderIds },
            productId: { not: productId },
          },
          select: {
            productId: true,
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                averageRating: true,
                images: { orderBy: { position: 'asc' }, take: 1 },
              },
            },
          },
        })
      : [];

    // Deduplicate and count frequency
    const productMap = new Map<string, { product: any; count: number }>();
    alsoBought.forEach(item => {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.count++;
      } else {
        productMap.set(item.productId, { product: item.product, count: 1 });
      }
    });

    const recommendations = Array.from(productMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
      .map(({ product }) => ({
        ...product,
        price: Number(product.price),
        image: product.images[0]?.url || null,
      }));

    // If not enough recommendations, fill with same-category products
    if (recommendations.length < 6) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { categories: { select: { id: true } } },
      });
      const categoryIds = product?.categories.map(c => c.id) || [];

      if (categoryIds.length > 0) {
        const similar = await prisma.product.findMany({
          where: {
            id: { not: productId, notIn: recommendations.map(r => r.id) },
            status: 'ACTIVE',
            categories: { some: { id: { in: categoryIds } } },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            averageRating: true,
            images: { orderBy: { position: 'asc' }, take: 1 },
          },
          orderBy: { averageRating: 'desc' },
          take: 12 - recommendations.length,
        });

        similar.forEach(p => {
          recommendations.push({
            ...p,
            price: Number(p.price),
            image: p.images[0]?.url || null,
          });
        });
      }
    }

    // Frequently bought together (top 2 co-purchased)
    const frequentlyBoughtTogether = Array.from(productMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .map(({ product }) => ({
        ...product,
        price: Number(product.price),
        image: product.images[0]?.url || null,
      }));

    return NextResponse.json({
      alsoBought: recommendations,
      frequentlyBoughtTogether,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ alsoBought: [], frequentlyBoughtTogether: [] });
  }
}
