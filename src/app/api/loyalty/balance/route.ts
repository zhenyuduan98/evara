import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    let loyalty = await prisma.loyaltyPoints.findUnique({
      where: { userId },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!loyalty) {
      loyalty = await prisma.loyaltyPoints.create({
        data: { userId, points: 0, lifetimePoints: 0 },
        include: { transactions: true },
      });
    }

    return NextResponse.json(loyalty);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get balance' }, { status: 500 });
  }
}
