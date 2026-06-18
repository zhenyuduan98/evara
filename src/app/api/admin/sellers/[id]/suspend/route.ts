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
      data: { status: 'SUSPENDED' },
    });

    return successResponse({ seller });
  } catch (error) {
    console.error('Suspend seller error:', error);
    return errorResponse('Failed to suspend seller', 500);
  }
}
