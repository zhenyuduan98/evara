import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const [showcases, total] = await Promise.all([
    prisma.buyerShowcase.findMany({
      where: { productId: params.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } },
      },
    }),
    prisma.buyerShowcase.count({ where: { productId: params.id } }),
  ]);

  return NextResponse.json({ showcases, total, page, totalPages: Math.ceil(total / limit) });
}
