import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const history = await prisma.priceHistory.findMany({
    where: {
      productId: params.id,
      changedAt: { gte: thirtyDaysAgo },
    },
    orderBy: { changedAt: 'asc' },
    select: {
      id: true,
      price: true,
      changedAt: true,
    },
  });

  return NextResponse.json(
    history.map((h) => ({
      id: h.id,
      price: Number(h.price),
      changedAt: h.changedAt.toISOString(),
    }))
  );
}
