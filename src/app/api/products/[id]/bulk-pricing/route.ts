import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const discounts = await prisma.bulkDiscount.findMany({
      where: { productId: params.id },
      orderBy: { minQuantity: 'asc' },
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Bulk pricing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
