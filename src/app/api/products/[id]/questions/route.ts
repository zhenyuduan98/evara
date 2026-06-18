import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const questions = await prisma.question.findMany({
    where: { productId: params.id },
    include: {
      user: { select: { name: true, image: true } },
      answers: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { helpfulCount: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ questions });
}

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
    return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: { userId, productId: params.id, body: body.trim() },
    include: { user: { select: { name: true, image: true } } },
  });

  return NextResponse.json({ question }, { status: 201 });
}
