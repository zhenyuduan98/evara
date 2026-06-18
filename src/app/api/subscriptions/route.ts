import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateDiscount, getNextDeliveryDate } from '@/lib/subscriptions';
import { SubscriptionFrequency } from '@prisma/client';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { productId, frequency, quantity = 1 } = body as {
    productId: string;
    frequency: SubscriptionFrequency;
    quantity?: number;
  };

  if (!productId || !frequency) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Count user's active subscriptions for discount calc
  const activeCount = await prisma.subscription.count({
    where: { userId: session.user.id, status: 'ACTIVE' },
  });
  const discountPercent = calculateDiscount(activeCount + 1);

  const nextDelivery = getNextDeliveryDate(new Date(), frequency);

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      productId,
      frequency,
      quantity,
      discountPercent,
      nextDelivery,
    },
    include: { product: { select: { title: true, price: true, images: { take: 1 } } } },
  });

  return NextResponse.json(subscription, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { id: true, title: true, slug: true, price: true, images: { take: 1, orderBy: { position: 'asc' } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(subscriptions);
}
