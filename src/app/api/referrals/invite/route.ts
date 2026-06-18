import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const existing = await prisma.referralCode.findFirst({ where: { userId } });
    if (existing) {
      return NextResponse.json(existing);
    }

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const referral = await prisma.referralCode.create({
      data: { userId, code, reward: 10.00 },
    });

    return NextResponse.json(referral, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate referral' }, { status: 500 });
  }
}
