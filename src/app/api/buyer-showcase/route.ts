import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const [showcases, total] = await Promise.all([
    prisma.buyerShowcase.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } },
        product: { select: { id: true, title: true, slug: true, images: { take: 1, select: { url: true } } } },
      },
    }),
    prisma.buyerShowcase.count(),
  ]);

  return NextResponse.json({ showcases, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, orderId, title, content, images } = await request.json();
  if (!productId || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'productId, title, and content are required' }, { status: 400 });
  }

  const showcase = await prisma.buyerShowcase.create({
    data: {
      userId,
      productId,
      orderId: orderId || null,
      title: title.trim(),
      content: content.trim(),
      images: images || null,
    },
    include: {
      user: { select: { name: true, image: true } },
      product: { select: { id: true, title: true, slug: true } },
    },
  });

  return NextResponse.json({ showcase }, { status: 201 });
}
