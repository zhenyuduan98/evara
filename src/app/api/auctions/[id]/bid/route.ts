import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// In-memory bid event emitter for SSE
const bidListeners = new Map<string, Set<(data: string) => void>>();

export function notifyBidListeners(auctionId: string, data: object) {
  const listeners = bidListeners.get(auctionId);
  if (listeners) {
    const payload = JSON.stringify(data);
    listeners.forEach((cb) => cb(payload));
  }
}

export { bidListeners };

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount } = await request.json();
  if (!amount || isNaN(parseFloat(amount))) {
    return NextResponse.json({ error: 'Invalid bid amount' }, { status: 400 });
  }

  const bidAmount = parseFloat(amount);

  // Use a transaction for atomicity
  const result = await prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({ where: { id: params.id } });
    if (!auction) throw new Error('Auction not found');

    const now = new Date();
    if (auction.status !== 'ACTIVE' || now < auction.startAt || now > auction.endsAt) {
      throw new Error('Auction is not active');
    }
    if (auction.sellerId === session.user!.id) {
      throw new Error('Cannot bid on your own auction');
    }

    const minBid = auction.currentBid
      ? Number(auction.currentBid) + 0.01
      : Number(auction.startPrice);

    if (bidAmount < minBid) {
      throw new Error(`Bid must be at least $${minBid.toFixed(2)}`);
    }

    const bid = await tx.auctionBid.create({
      data: {
        auctionId: params.id,
        userId: session.user!.id,
        amount: bidAmount,
      },
    });

    const updated = await tx.auction.update({
      where: { id: params.id },
      data: {
        currentBid: bidAmount,
        currentBidderId: session.user!.id,
        bidCount: { increment: 1 },
      },
    });

    return { bid, auction: updated };
  });

  // Notify SSE listeners
  notifyBidListeners(params.id, {
    type: 'new_bid',
    bid: {
      id: result.bid.id,
      amount: result.bid.amount,
      userId: session.user.id,
      userName: session.user.name,
      createdAt: result.bid.createdAt,
    },
    currentBid: result.auction.currentBid,
    bidCount: result.auction.bidCount,
  });

  return NextResponse.json(result.bid, { status: 201 });
}
