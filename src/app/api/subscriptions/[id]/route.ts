import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getNextDeliveryDate } from '@/lib/subscriptions';
import { SubscriptionFrequency } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  const body = await req.json();
  const { frequency, quantity, action } = body as {
    frequency?: SubscriptionFrequency;
    quantity?: number;
    action?: 'pause' | 'resume' | 'cancel' | 'skip';
  };

  const data: Record<string, unknown> = {};

  if (action === 'pause') data.status = 'PAUSED';
  else if (action === 'resume') data.status = 'ACTIVE';
  else if (action === 'cancel') data.status = 'CANCELLED';
  else if (action === 'skip') {
    data.nextDelivery = getNextDeliveryDate(subscription.nextDelivery, subscription.frequency);
  }

  if (frequency) {
    data.frequency = frequency;
    data.nextDelivery = getNextDeliveryDate(new Date(), frequency);
  }
  if (quantity && quantity > 0) data.quantity = quantity;

  const updated = await prisma.subscription.update({
    where: { id: params.id },
    data,
    include: { product: { select: { title: true, price: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  await prisma.subscription.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
  });

  return NextResponse.json({ success: true });
}
