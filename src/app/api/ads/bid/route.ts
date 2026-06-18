import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sponsoredProductId, bidAmount, dailyBudget } = body;

    if (!sponsoredProductId || !bidAmount || !dailyBudget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adBid = await prisma.adBid.create({
      data: {
        sponsoredProductId,
        bidAmount,
        dailyBudget,
      },
    });

    return NextResponse.json(adBid, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ad bid' }, { status: 500 });
  }
}
