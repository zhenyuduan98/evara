import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reviewer = await prisma.vineReviewer.findUnique({ where: { userId: user.id } });
  if (!reviewer) {
    return NextResponse.json({ error: 'Not a Vine reviewer' }, { status: 403 });
  }

  const claims = await prisma.vineClaim.findMany({
    where: { reviewerId: reviewer.id },
    include: {
      vineProduct: {
        include: { product: { include: { images: { take: 1 } } } },
      },
    },
    orderBy: { claimedAt: 'desc' },
  });

  return NextResponse.json(claims);
}
