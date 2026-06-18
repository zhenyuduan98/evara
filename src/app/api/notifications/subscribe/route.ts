import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { endpoint, keys } = await req.json();

  if (!endpoint || !keys) {
    return NextResponse.json({ error: 'endpoint and keys required' }, { status: 400 });
  }

  // Upsert by endpoint
  const existing = await prisma.pushSubscription.findFirst({
    where: { userId: session.user.id, endpoint },
  });

  if (existing) {
    const sub = await prisma.pushSubscription.update({
      where: { id: existing.id },
      data: { keys },
    });
    return NextResponse.json({ subscription: sub });
  }

  const subscription = await prisma.pushSubscription.create({
    data: { userId: session.user.id, endpoint, keys },
  });

  return NextResponse.json({ subscription }, { status: 201 });
}
