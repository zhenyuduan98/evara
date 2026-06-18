import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateShareCode } from '@/lib/gift-registry';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const registry = await prisma.giftRegistry.create({
    data: {
      userId: session.user.id,
      name: body.name,
      eventType: body.eventType,
      eventDate: body.eventDate ? new Date(body.eventDate) : null,
      description: body.description || null,
      isPublic: body.isPublic ?? true,
      shareCode: generateShareCode(),
    },
  });
  return NextResponse.json(registry, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const registries = await prisma.giftRegistry.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(registries);
}
