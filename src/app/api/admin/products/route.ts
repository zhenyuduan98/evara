import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, slugify, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const body = await request.json();
    const { title, description, bulletPoints, brand, price, compareAtPrice, sku, categoryIds, variants, images } = body;

    if (!title || !brand || !price || !sku) {
      return errorResponse('Missing required fields: title, brand, price, sku');
    }

    const slug = slugify(title) + '-' + Date.now().toString(36);
    const userId = (session.user as { id: string }).id;

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description: description || null,
        bulletPoints: bulletPoints || [],
        brand,
        price,
        compareAtPrice: compareAtPrice || null,
        sku,
        sellerId: userId,
        categories: categoryIds?.length
          ? { connect: categoryIds.map((id: string) => ({ id })) }
          : undefined,
        variants: variants?.length
          ? {
              create: variants.map((v: { name: string; sku: string; price?: number; stock?: number; options?: unknown }) => ({
                name: v.name,
                sku: v.sku,
                price: v.price ?? null,
                stock: v.stock ?? 0,
                options: v.options ?? {},
              })),
            }
          : undefined,
        images: images?.length
          ? {
              create: images.map((img: { url: string; alt?: string }, i: number) => ({
                url: img.url,
                alt: img.alt || null,
                position: i,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        variants: true,
        categories: true,
      },
    });

    return successResponse(product, 201);
  } catch (error) {
    console.error('Product POST error:', error);
    return errorResponse('Failed to create product', 500);
  }
}
