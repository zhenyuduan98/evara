import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string; itemId: string } }
) {
  const registry = await prisma.giftRegistry.findUnique({
    where: { shareCode: params.code },
  });
  if (!registry || !registry.isPublic) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const item = await prisma.giftRegistryItem.findFirst({
    where: { id: params.itemId, registryId: registry.id },
  });
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  if (item.purchasedQuantity >= item.quantity) {
    return NextResponse.json({ error: 'Already fully purchased' }, { status: 400 });
  }
  const updated = await prisma.giftRegistryItem.update({
    where: { id: params.itemId },
    data: { purchasedQuantity: { increment: 1 } },
    include: { product: true },
  });
  return NextResponse.json(updated);
}
