import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const answerId = params.id;

  // Upsert vote
  const existing = await prisma.answerVote.findUnique({
    where: { userId_answerId: { userId, answerId } },
  });

  if (existing) {
    // Remove vote
    await prisma.answerVote.delete({ where: { id: existing.id } });
    await prisma.answer.update({
      where: { id: answerId },
      data: { helpfulCount: { decrement: 1 } },
    });
    return NextResponse.json({ voted: false });
  } else {
    await prisma.answerVote.create({
      data: { userId, answerId },
    });
    await prisma.answer.update({
      where: { id: answerId },
      data: { helpfulCount: { increment: 1 } },
    });
    return NextResponse.json({ voted: true });
  }
}
