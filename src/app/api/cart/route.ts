import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cartAddSchema, cartUpdateSchema } from '@/lib/validations';

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id;
}

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { position: 'asc' }, take: 1 }, seller: { select: { id: true, name: true } } } },
          variant: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return NextResponse.json({ cart });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = cartAddSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  const { productId, variantId, quantity } = parsed.data;

  // Max quantity validation
  if (quantity > 10) {
    return NextResponse.json({ error: 'Maximum 10 per product' }, { status: 400 });
  }

  // Validate stock
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }
  }

  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId_variantId: { cartId: cart.id, productId, variantId: variantId || null } },
  });

  let item;
  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, 10);
    item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty, savedForLater: false },
    });
  } else {
    item = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId: variantId || null, quantity },
    });
  }

  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = cartUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  const { itemId, quantity } = parsed.data;
  if (quantity > 10) {
    return NextResponse.json({ error: 'Maximum 10 per product' }, { status: 400 });
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, variant: true },
  });
  if (!item || item.cart.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (item.variant && item.variant.stock < quantity) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
  }

  const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { itemId } = await req.json();
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
