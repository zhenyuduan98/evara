import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);

    const { updates } = await request.json();
    if (!Array.isArray(updates)) {
      return errorResponse('updates must be an array');
    }

    const results = await prisma.$transaction(
      updates.map((u: { variantId: string; stock: number; note?: string }) =>
        prisma.productVariant.update({
          where: { id: u.variantId },
          data: { stock: u.stock },
        })
      )
    );

    // Log inventory changes
    await prisma.inventoryLog.createMany({
      data: updates.map((u: { variantId: string; stock: number; note?: string; productId?: string }) => ({
        productId: u.productId || '',
        variantId: u.variantId,
        type: 'ADJUSTMENT' as const,
        quantity: u.stock,
        note: u.note || 'Bulk inventory update',
      })),
    });

    return NextResponse.json({ success: true, updated: results.length });
  } catch (error) {
    console.error('Bulk inventory error:', error);
    return errorResponse('Internal server error', 500);
  }
}
