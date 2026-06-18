import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, slugify, successResponse, errorResponse } from '@/lib/api-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Product not found', 404);

    const body = await request.json();
    const { title, description, bulletPoints, brand, price, compareAtPrice, sku, status, categoryIds } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) { data.title = title; data.slug = slugify(title) + '-' + Date.now().toString(36); }
    if (description !== undefined) data.description = description;
    if (bulletPoints !== undefined) data.bulletPoints = bulletPoints;
    if (brand !== undefined) data.brand = brand;
    if (price !== undefined) data.price = price;
    if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice;
    if (sku !== undefined) data.sku = sku;
    if (status !== undefined) data.status = status;

    if (categoryIds) {
      data.categories = { set: categoryIds.map((id: string) => ({ id })) };
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { images: true, variants: true, categories: true },
    });

    return successResponse(product);
  } catch (error) {
    console.error('Product PUT error:', error);
    return errorResponse('Failed to update product', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Product not found', 404);

    await prisma.product.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    });

    return successResponse({ message: 'Product archived' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return errorResponse('Failed to archive product', 500);
  }
}
