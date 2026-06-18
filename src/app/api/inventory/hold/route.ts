import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { productId, variantId, userId, quantity } = await req.json();

    if (!productId || !userId || !quantity) {
      return NextResponse.json({ error: 'productId, userId, quantity required' }, { status: 400 });
    }

    // Clean up expired holds first
    await prisma.inventoryHold.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Check available stock
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 });

      const existingHolds = await prisma.inventoryHold.aggregate({
        where: { variantId, expiresAt: { gt: new Date() } },
        _sum: { quantity: true },
      });
      const heldQty = existingHolds._sum.quantity || 0;
      if (variant.stock - heldQty < quantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 409 });
      }
    }

    const hold = await prisma.inventoryHold.create({
      data: {
        productId,
        variantId: variantId || null,
        userId,
        quantity,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    return NextResponse.json(hold, { status: 201 });
  } catch (error) {
    console.error('Inventory hold error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  // Clean expired on read
  await prisma.inventoryHold.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  const holds = await prisma.inventoryHold.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(holds);
}
