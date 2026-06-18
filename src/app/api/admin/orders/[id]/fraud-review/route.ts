import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { flagged, reviewedBy } = body;

    const fraudScore = await prisma.fraudScore.upsert({
      where: { orderId: id },
      update: { flagged: flagged ?? false, reviewedBy: reviewedBy || null },
      create: {
        orderId: id,
        score: body.score || 0,
        factors: body.factors || {},
        flagged: flagged ?? false,
        reviewedBy: reviewedBy || null,
      },
    });

    return NextResponse.json({ fraudScore });
  } catch (error) {
    console.error('Fraud review error:', error);
    return NextResponse.json({ error: 'Failed to update fraud review' }, { status: 500 });
  }
}
