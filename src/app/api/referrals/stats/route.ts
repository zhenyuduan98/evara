import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const referral = await prisma.referralCode.findFirst({ where: { userId } });
    if (!referral) {
      return NextResponse.json({ code: null, usedCount: 0, totalRewards: 0 });
    }

    return NextResponse.json({
      code: referral.code,
      usedCount: referral.usedCount,
      totalRewards: Number(referral.reward) * referral.usedCount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
