import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const stream = await prisma.liveStream.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, image: true } },
        products: {
          include: {
            product: {
              select: { id: true, title: true, price: true, images: { take: 1 } },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
        comments: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    return NextResponse.json(stream);
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 });
  }
}
