import prisma from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Admin access required', 403);

    const existing = await prisma.seller.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Seller not found', 404);

    const seller = await prisma.seller.update({
      where: { id: params.id },
      data: { status: 'APPROVED', kycVerified: true },
    });

    // Mark all pending KYC docs as verified
    await prisma.sellerKYC.updateMany({
      where: { sellerId: params.id, status: 'PENDING' },
      data: { status: 'VERIFIED', reviewedAt: new Date() },
    });

    return successResponse({ seller });
  } catch (error) {
    console.error('Approve seller error:', error);
    return errorResponse('Failed to approve seller', 500);
  }
}
