import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse } from '@/lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);

    const { action } = await request.json();
    if (!['approve', 'reject', 'hide'].includes(action)) {
      return errorResponse('Invalid action. Must be approve, reject, or hide');
    }

    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) return errorResponse('Review not found', 404);

    if (action === 'hide') {
      await prisma.review.update({
        where: { id: params.id },
        data: { hidden: true },
      });
    } else if (action === 'approve') {
      await prisma.review.update({
        where: { id: params.id },
        data: { hidden: false },
      });
      // Approve all pending flags for this review
      await prisma.reviewFlag.updateMany({
        where: { reviewId: params.id, status: 'PENDING' },
        data: { status: 'REJECTED' },
      });
    } else if (action === 'reject') {
      await prisma.review.update({
        where: { id: params.id },
        data: { hidden: true },
      });
      await prisma.reviewFlag.updateMany({
        where: { reviewId: params.id, status: 'PENDING' },
        data: { status: 'APPROVED' },
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('Moderate review error:', error);
    return errorResponse('Internal server error', 500);
  }
}
