import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subscription } = await req.json();
  if (!subscription?.endpoint || !subscription?.keys) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  // Upsert by endpoint
  const existing = await prisma.pushSubscription.findFirst({
    where: { userId: session.user.id, endpoint: subscription.endpoint },
  });

  if (existing) {
    return NextResponse.json({ subscription: existing });
  }

  const saved = await prisma.pushSubscription.create({
    data: {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
  });

  return NextResponse.json({ subscription: saved }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { endpoint } = await req.json();
  if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 });

  await prisma.pushSubscription.deleteMany({
    where: { userId: session.user.id, endpoint },
  });

  return NextResponse.json({ success: true });
}
