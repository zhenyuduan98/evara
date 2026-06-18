import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse } from '@/lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);

    const { reason } = await request.json();
    if (!reason || typeof reason !== 'string') {
      return errorResponse('Reason is required');
    }

    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) return errorResponse('Review not found', 404);

    const userId = (session.user as { id: string }).id;

    const flag = await prisma.reviewFlag.create({
      data: {
        reviewId: params.id,
        userId,
        reason,
      },
    });

    return NextResponse.json({ success: true, flag }, { status: 201 });
  } catch (error) {
    console.error('Flag review error:', error);
    return errorResponse('Internal server error', 500);
  }
}
