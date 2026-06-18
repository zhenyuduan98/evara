import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Barcode code is required' }, { status: 400 });
  }

  const barcode = await prisma.barcode.findUnique({
    where: { code },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { position: 'asc' } },
        },
      },
    },
  });

  if (!barcode) {
    return NextResponse.json({ error: 'Product not found for this barcode' }, { status: 404 });
  }

  return NextResponse.json({
    barcode: {
      id: barcode.id,
      type: barcode.type,
      code: barcode.code,
    },
    product: {
      id: barcode.product.id,
      title: barcode.product.title,
      slug: barcode.product.slug,
      price: barcode.product.price.toString(),
      image: barcode.product.images[0]?.url || null,
    },
  });
}
