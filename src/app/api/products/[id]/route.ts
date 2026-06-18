import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        categories: { select: { id: true, name: true, slug: true } },
        seller: { select: { name: true } },
      },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return successResponse(product);
  } catch (error) {
    console.error('Product GET error:', error);
    return errorResponse('Failed to fetch product', 500);
  }
}
