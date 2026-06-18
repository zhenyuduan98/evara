import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, code } = body;

    if (!productId || !type || !code) {
      return NextResponse.json({ error: 'productId, type, and code are required' }, { status: 400 });
    }

    if (!['UPC', 'EAN', 'ISBN'].includes(type)) {
      return NextResponse.json({ error: 'type must be UPC, EAN, or ISBN' }, { status: 400 });
    }

    const barcode = await prisma.barcode.create({
      data: { productId, type, code },
    });

    return NextResponse.json({ barcode }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Barcode already exists' }, { status: 409 });
    }
    console.error('Create barcode error:', error);
    return NextResponse.json({ error: 'Failed to create barcode' }, { status: 500 });
  }
}
