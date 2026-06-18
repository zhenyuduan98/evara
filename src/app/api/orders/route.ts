import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: user.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId: user.id } }),
    ]);

    return successResponse({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Orders error:', error);
    return errorResponse('Internal server error', 500);
  }
}
