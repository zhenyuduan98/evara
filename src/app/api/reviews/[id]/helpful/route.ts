import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviewId = params.id;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const existing = await prisma.reviewVote.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });

    if (existing) {
      if (existing.helpful) {
        await prisma.reviewVote.delete({ where: { id: existing.id } });
        await prisma.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { decrement: 1 } },
        });
        return NextResponse.json({ voted: false });
      }
      await prisma.reviewVote.update({ where: { id: existing.id }, data: { helpful: true } });
      await prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
      return NextResponse.json({ voted: true });
    }

    await prisma.reviewVote.create({ data: { userId, reviewId, helpful: true } });
    await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });

    return NextResponse.json({ voted: true });
  } catch (error) {
    console.error('Helpful vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
