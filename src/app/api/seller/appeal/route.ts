import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);
    if (seller.status !== 'SUSPENDED') return errorResponse('Only suspended sellers can appeal', 400);

    const { reason } = await request.json();
    if (!reason) return errorResponse('Reason is required', 400);

    const existing = await prisma.sellerAppeal.findFirst({
      where: { sellerId: seller.id, status: 'PENDING' },
    });
    if (existing) return errorResponse('You already have a pending appeal', 400);

    const appeal = await prisma.sellerAppeal.create({
      data: { sellerId: seller.id, reason },
    });

    return successResponse(appeal, 201);
  } catch (error) {
    console.error('Appeal error:', error);
    return errorResponse('Failed to submit appeal', 500);
  }
}
