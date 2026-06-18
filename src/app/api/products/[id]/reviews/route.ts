import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';
import { reviewCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = req.nextUrl;
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;

  const orderBy = sort === 'highest' ? { rating: 'desc' as const }
    : sort === 'lowest' ? { rating: 'asc' as const }
    : sort === 'helpful' ? { helpfulCount: 'desc' as const }
    : { createdAt: 'desc' as const };

  const [reviews, total, distribution] = await Promise.all([
    prisma.review.findMany({
      where: { productId: params.id },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where: { productId: params.id } }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { productId: params.id },
      _count: true,
    }),
  ]);

  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach((d) => { ratingDistribution[d.rating] = d._count; });

  return successResponse({ reviews, total, pages: Math.ceil(total / limit), ratingDistribution });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession();
  if (!session?.user) return errorResponse('Unauthorized', 401);
  const userId = (session.user as { id: string }).id;

  const body = await req.json();
  const parsed = reviewCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues?.[0]?.message || parsed.error.message);
  const { rating, title, body: reviewBody, images } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return errorResponse('Product not found', 404);

    const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId: params.id } },
  });
  if (existing) return errorResponse('You already reviewed this product');

  // Check if user purchased this product
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: params.id,
      order: { userId, status: { in: ['DELIVERED', 'SHIPPED'] } },
    },
  });

  const review = await prisma.review.create({
    data: {
      userId,
      productId: params.id,
      rating,
      title,
      body: reviewBody,
      images: images || [],
      verifiedPurchase: !!purchased,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  // Update product averageRating and reviewCount
  const agg = await prisma.review.aggregate({
    where: { productId: params.id },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: params.id },
    data: { averageRating: agg._avg.rating || 0, reviewCount: agg._count },
  });

    return successResponse(review, 201);
  } catch (error) {
    console.error('Review creation error:', error);
    return errorResponse('Internal server error', 500);
  }
}
