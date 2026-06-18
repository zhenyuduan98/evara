import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;

    let body;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid or missing request body', 400);
    }
    const { helpful } = body;
    if (typeof helpful !== 'boolean') return errorResponse('helpful must be boolean');

    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) return errorResponse('Review not found', 404);

    const vote = await prisma.reviewVote.upsert({
      where: { userId_reviewId: { userId, reviewId: params.id } },
      create: { userId, reviewId: params.id, helpful },
      update: { helpful },
    });

    const helpfulCount = await prisma.reviewVote.count({
      where: { reviewId: params.id, helpful: true },
    });
    await prisma.review.update({
      where: { id: params.id },
      data: { helpfulCount },
    });

    return successResponse(vote);
  } catch (error) {
    console.error('Vote error:', error);
    return errorResponse('Internal server error', 500);
  }
}
