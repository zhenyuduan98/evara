import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const body = await request.json();
    const { productIds } = body as { productIds: string[] };

    if (!productIds?.length) return errorResponse('No product IDs provided', 400);

    // Verify ownership
    const ownedProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, sellerId: userId },
      select: { id: true },
    });
    const ownedIds = ownedProducts.map(p => p.id);
    if (ownedIds.length === 0) return errorResponse('No matching products found', 404);

    // Soft delete by setting status to ARCHIVED
    const result = await prisma.product.updateMany({
      where: { id: { in: ownedIds } },
      data: { status: 'ARCHIVED' },
    });

    return successResponse({ deleted: result.count });
  } catch (error) {
    return errorResponse('Bulk delete failed', 500);
  }
}
