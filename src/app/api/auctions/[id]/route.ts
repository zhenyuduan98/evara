import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auction = await prisma.auction.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { id: true, name: true, image: true } },
      product: { select: { id: true, title: true, slug: true, images: { take: 3 }, price: true } },
      bids: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!auction) {
    return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
  }

  return NextResponse.json(auction);
}
