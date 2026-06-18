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

  const { body } = await request.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Answer body required' }, { status: 400 });
  }

  // Check if user is a seller of the product this question belongs to
  const question = await prisma.question.findUnique({
    where: { id: params.id },
    include: { product: { select: { sellerId: true } } },
  });

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const isSeller = question.product.sellerId === userId;
  const answer = await prisma.answer.create({
    data: {
      questionId: params.id,
      userId,
      body: body.trim(),
      isSeller,
    },
    include: {
      user: { select: { name: true, image: true } },
    },
  });

  return NextResponse.json({ answer }, { status: 201 });
}
