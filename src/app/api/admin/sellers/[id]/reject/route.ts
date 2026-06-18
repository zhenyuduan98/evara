import prisma from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Admin access required', 403);

    const { reason } = await request.json();

    const existing = await prisma.seller.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Seller not found', 404);

    const seller = await prisma.seller.update({
      where: { id: params.id },
      data: { status: 'PENDING', kycVerified: false },
    });

    await prisma.sellerKYC.updateMany({
      where: { sellerId: params.id, status: 'PENDING' },
      data: { status: 'REJECTED', reviewedAt: new Date(), reviewNote: reason || 'Rejected' },
    });

    return successResponse({ seller });
  } catch (error) {
    console.error('Reject seller error:', error);
    return errorResponse('Failed to reject seller', 500);
  }
}
