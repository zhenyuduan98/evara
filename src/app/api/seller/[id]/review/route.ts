import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;

    const { rating, comment, orderId } = await request.json();
    if (!rating || rating < 1 || rating > 5) return errorResponse('Rating must be 1-5', 400);
    if (!orderId) return errorResponse('orderId required', 400);

    const seller = await prisma.seller.findUnique({ where: { id: params.id } });
    if (!seller) return errorResponse('Seller not found', 404);

    // Verify buyer has an order with this seller
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        items: { some: { product: { sellerProfileId: params.id } } },
      },
    });
    if (!order) return errorResponse('No matching order found', 403);

    const review = await prisma.sellerReview.upsert({
      where: { buyerId_sellerId_orderId: { buyerId: userId, sellerId: params.id, orderId } },
      create: { buyerId: userId, sellerId: params.id, orderId, rating, comment },
      update: { rating, comment },
    });

    // Update seller avg rating
    const allReviews = await prisma.sellerReview.findMany({ where: { sellerId: params.id } });
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await prisma.seller.update({ where: { id: params.id }, data: { rating: avgRating } });

    return successResponse(review);
  } catch (error) {
    console.error('Seller review error:', error);
    return errorResponse('Failed to submit review', 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.sellerReview.findMany({
      where: { sellerId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return successResponse({ reviews, avgRating: avg, total: reviews.length });
  } catch (error) {
    console.error('Get reviews error:', error);
    return errorResponse('Failed to fetch reviews', 500);
  }
}
