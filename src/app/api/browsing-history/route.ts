import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.viewHistory.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { images: { take: 1 } } } },
    orderBy: { viewedAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(items);
}
