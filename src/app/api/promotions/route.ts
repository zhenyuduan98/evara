import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const now = new Date();

  const where: any = {
    isActive: true,
    startDate: { lte: now },
    endDate: { gte: now },
  };

  if (type) {
    where.type = type;
  }

  const promotions = await prisma.promotion.findMany({
    where,
    orderBy: { endDate: 'asc' },
  });

  return NextResponse.json({ promotions });
}
