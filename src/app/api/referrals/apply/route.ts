import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, newUserId } = body;

    if (!code || !newUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const referral = await prisma.referralCode.findUnique({ where: { code } });
    if (!referral) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    if (referral.userId === newUserId) {
      return NextResponse.json({ error: 'Cannot use own referral code' }, { status: 400 });
    }

    await prisma.referralCode.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, reward: Number(referral.reward) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to apply referral' }, { status: 500 });
  }
}
