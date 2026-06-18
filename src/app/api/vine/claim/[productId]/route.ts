import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reviewer = await prisma.vineReviewer.findUnique({ where: { userId: user.id } });
  if (!reviewer) {
    return NextResponse.json({ error: 'Not a Vine reviewer' }, { status: 403 });
  }

  const vineProduct = await prisma.vineProduct.findUnique({
    where: { id: params.productId },
  });
  if (!vineProduct || vineProduct.samplesAvailable <= vineProduct.samplesClaimed) {
    return NextResponse.json({ error: 'No samples available' }, { status: 400 });
  }

  // Check if already claimed
  const existing = await prisma.vineClaim.findUnique({
    where: { vineProductId_reviewerId: { vineProductId: vineProduct.id, reviewerId: reviewer.id } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
  }

  const [claim] = await prisma.$transaction([
    prisma.vineClaim.create({
      data: { vineProductId: vineProduct.id, reviewerId: reviewer.id },
    }),
    prisma.vineProduct.update({
      where: { id: vineProduct.id },
      data: { samplesClaimed: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(claim);
}
