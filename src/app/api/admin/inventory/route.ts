import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);

    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        sku: true,
        variants: {
          select: { id: true, name: true, sku: true, stock: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { title: 'asc' },
    });

    const result = products.map((p) => ({
      ...p,
      totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
    }));

    return NextResponse.json({ products: result });
  } catch (error) {
    console.error('Inventory error:', error);
    return errorResponse('Internal server error', 500);
  }
}
