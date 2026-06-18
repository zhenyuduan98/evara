import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, content } = body;

    if (!userId || !content) {
      return NextResponse.json({ error: 'userId and content are required' }, { status: 400 });
    }

    const comment = await prisma.liveComment.create({
      data: {
        streamId: params.id,
        userId,
        content,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
