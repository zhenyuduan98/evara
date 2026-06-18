import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const registry = await prisma.giftRegistry.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!registry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const item = await prisma.giftRegistryItem.create({
    data: {
      registryId: params.id,
      productId: body.productId,
      quantity: body.quantity || 1,
      priority: body.priority || 'MEDIUM',
      note: body.note || null,
    },
    include: { product: true },
  });
  return NextResponse.json(item, { status: 201 });
}
