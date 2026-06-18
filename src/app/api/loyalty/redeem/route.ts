import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, points, orderId } = body;

    if (!userId || !points || points <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const loyalty = await prisma.loyaltyPoints.findUnique({ where: { userId } });
    if (!loyalty || loyalty.points < points) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    const [updatedLoyalty, transaction] = await prisma.$transaction([
      prisma.loyaltyPoints.update({
        where: { userId },
        data: { points: { decrement: points } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          loyaltyPointsId: loyalty.id,
          points: -points,
          type: 'REDEEM',
          description: `Redeemed ${points} points`,
          orderId,
        },
      }),
    ]);

    return NextResponse.json({
      remainingPoints: updatedLoyalty.points,
      discount: points / 100, // 100 points = $1
      transaction,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to redeem points' }, { status: 500 });
  }
}
