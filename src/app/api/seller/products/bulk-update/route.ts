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
    const { productIds, updates } = body as { productIds: string[]; updates: { price?: number; status?: string; stock?: number } };

    if (!productIds?.length) return errorResponse('No product IDs provided', 400);
    if (!updates || Object.keys(updates).length === 0) return errorResponse('No updates provided', 400);

    // Verify ownership
    const ownedProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, sellerId: userId },
      select: { id: true },
    });
    const ownedIds = ownedProducts.map(p => p.id);
    if (ownedIds.length === 0) return errorResponse('No matching products found', 404);

    const updateData: Record<string, unknown> = {};
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.status && ['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(updates.status)) {
      updateData.status = updates.status;
    }

    // Update products
    const result = await prisma.product.updateMany({
      where: { id: { in: ownedIds } },
      data: updateData,
    });

    // Update stock on variants if provided
    if (updates.stock !== undefined) {
      await prisma.productVariant.updateMany({
        where: { productId: { in: ownedIds } },
        data: { stock: updates.stock },
      });
    }

    return successResponse({ updated: result.count });
  } catch (error) {
    return errorResponse('Bulk update failed', 500);
  }
}
