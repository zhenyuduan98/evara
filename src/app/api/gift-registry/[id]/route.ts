import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const registry = await prisma.giftRegistry.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { items: { include: { product: true } } },
  });
  if (!registry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(registry);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const registry = await prisma.giftRegistry.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: {
      name: body.name,
      eventType: body.eventType,
      eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      description: body.description,
      isPublic: body.isPublic,
    },
  });
  if (registry.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.giftRegistry.findUnique({ where: { id: params.id } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await prisma.giftRegistry.deleteMany({
    where: { id: params.id, userId: session.user.id },
  });
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
