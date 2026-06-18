import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { productId, displayOrder, specialPrice, isActive } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // Verify stream exists
    const stream = await prisma.liveStream.findUnique({ where: { id: params.id } });
    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const liveProduct = await prisma.liveProduct.upsert({
      where: { id: body.id || '' },
      create: {
        streamId: params.id,
        productId,
        displayOrder: displayOrder ?? 0,
        specialPrice,
        isActive: isActive ?? false,
      },
      update: {
        displayOrder,
        specialPrice,
        isActive,
      },
      include: {
        product: { select: { id: true, title: true, price: true, images: { take: 1 } } },
      },
    });

    return NextResponse.json(liveProduct, { status: 201 });
  } catch (error) {
    console.error('Error adding product to stream:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
