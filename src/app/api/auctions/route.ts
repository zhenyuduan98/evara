import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const now = new Date();
  const where: Record<string, unknown> = {};

  if (status === 'active') {
    where.status = 'ACTIVE';
    where.startAt = { lte: now };
    where.endsAt = { gt: now };
  } else if (status === 'scheduled') {
    where.status = 'SCHEDULED';
    where.startAt = { gt: now };
  } else {
    where.OR = [
      { status: 'ACTIVE', startAt: { lte: now }, endsAt: { gt: now } },
      { status: 'SCHEDULED', startAt: { gt: now } },
    ];
  }

  const auctions = await prisma.auction.findMany({
    where,
    include: {
      seller: { select: { id: true, name: true, image: true } },
      product: { select: { id: true, title: true, images: { take: 1 } } },
    },
    orderBy: { endsAt: 'asc' },
    take: 50,
  });

  return NextResponse.json(auctions);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, startPrice, startAt, endsAt, productId } = body;

  if (!title || !startPrice || !startAt || !endsAt) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const auction = await prisma.auction.create({
    data: {
      title,
      description,
      startPrice: parseFloat(startPrice),
      startAt: new Date(startAt),
      endsAt: new Date(endsAt),
      status: new Date(startAt) <= new Date() ? 'ACTIVE' : 'SCHEDULED',
      sellerId: session.user.id,
      productId: productId || null,
    },
  });

  return NextResponse.json(auction, { status: 201 });
}
