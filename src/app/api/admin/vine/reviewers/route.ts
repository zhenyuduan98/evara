import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reviewers = await prisma.vineReviewer.findMany({
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { invitedAt: 'desc' },
  });

  return NextResponse.json(reviewers);
}
