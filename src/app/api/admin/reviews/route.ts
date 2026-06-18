import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);

    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { title: true } },
        flags: { where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Admin reviews error:', error);
    return errorResponse('Internal server error', 500);
  }
}
