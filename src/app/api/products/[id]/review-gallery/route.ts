import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const reviews = await prisma.review.findMany({
    where: { productId: params.id, hidden: false, images: { isEmpty: false } },
    select: {
      id: true,
      images: true,
      rating: true,
      title: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const gallery = reviews.flatMap(r =>
    r.images.map((img, i) => ({
      imageUrl: img,
      reviewId: r.id,
      rating: r.rating,
      title: r.title,
      userName: r.user.name,
    }))
  );

  return NextResponse.json(gallery);
}
