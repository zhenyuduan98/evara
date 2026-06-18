import { NextRequest, NextResponse } from 'next/server';
import { getSimilarProducts } from '@/lib/recommendations';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const products = await getSimilarProducts(params.productId);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Similar products error:', error);
    return NextResponse.json([]);
  }
}
