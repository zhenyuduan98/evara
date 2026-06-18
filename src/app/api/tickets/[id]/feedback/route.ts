import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { score, comment } = await req.json();
  if (!score || score < 1 || score > 5) {
    return NextResponse.json({ error: 'Score must be 1-5' }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const feedback = await prisma.ticketFeedback.create({
    data: {
      ticketId: params.id,
      userId: session.user.id,
      score,
      comment: comment || null,
    },
  });

  await prisma.ticket.update({
    where: { id: params.id },
    data: { csatScore: score },
  });

  return NextResponse.json(feedback);
}
