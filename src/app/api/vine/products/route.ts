import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, samplesAvailable } = await req.json();
  if (!productId || !samplesAvailable) {
    return NextResponse.json({ error: 'productId and samplesAvailable required' }, { status: 400 });
  }

  // Verify product belongs to seller
  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId: user.id },
  });
  if (!product) {
    return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 });
  }

  const vineProduct = await prisma.vineProduct.create({
    data: { productId, sellerId: user.id, samplesAvailable },
  });

  return NextResponse.json(vineProduct);
}
