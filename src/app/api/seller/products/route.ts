import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse, slugify } from '@/lib/api-helpers';

async function getSeller(userId: string) {
  return prisma.seller.findUnique({ where: { userId } });
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await getSeller(userId);
    if (!seller) return errorResponse('Not a seller', 403);

    const products = await prisma.product.findMany({
      where: { sellerId: userId },
      include: { images: { take: 1, orderBy: { position: 'asc' } }, categories: true },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ products });
  } catch (error) {
    console.error('Seller products GET error:', error);
    return errorResponse('Failed to fetch products', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await getSeller(userId);
    if (!seller) return errorResponse('Not a seller', 403);

    const body = await request.json();
    const { title, description, brand, price, compareAtPrice, sku, categoryIds, images, bulletPoints } = body;

    if (!title || !brand || !price || !sku) {
      return errorResponse('Title, brand, price, and SKU are required');
    }

    const slug = slugify(title) + '-' + Date.now().toString(36);

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
        status: 'ACTIVE',
        sellerId: userId,
        sellerProfileId: seller.id,
        categories: categoryIds?.length ? { connect: categoryIds.map((id: string) => ({ id })) } : undefined,
        images: images?.length
          ? { create: images.map((img: { url: string; alt?: string }, i: number) => ({ url: img.url, alt: img.alt || '', position: i })) }
          : undefined,
      },
      include: { images: true, categories: true },
    });

    return successResponse({ product }, 201);
  } catch (error) {
    console.error('Seller products POST error:', error);
    return errorResponse('Failed to create product', 500);
  }
}
