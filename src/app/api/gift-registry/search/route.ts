import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const eventType = searchParams.get('eventType');

  const where: Record<string, unknown> = { isPublic: true };
  if (query) {
    where.name = { contains: query, mode: 'insensitive' };
  }
  if (eventType) {
    where.eventType = eventType;
  }

  const registries = await prisma.giftRegistry.findMany({
    where,
    include: { user: { select: { name: true } }, _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return NextResponse.json(registries);
}
