import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sponsoredProductId = searchParams.get('sponsoredProductId');

    const where = sponsoredProductId ? { sponsoredProductId } : {};

    const [impressions, clicks, bids] = await Promise.all([
      prisma.adImpression.count({ where }),
      prisma.adClick.count({ where }),
      prisma.adBid.findMany({
        where,
        select: { spent: true },
      }),
    ]);

    const totalSpent = bids.reduce((sum, b) => sum + Number(b.spent), 0);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return NextResponse.json({
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      totalSpent,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
