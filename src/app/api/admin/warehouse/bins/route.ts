import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const warehouseId = searchParams.get('warehouseId');

  const where: Record<string, unknown> = {};
  if (warehouseId) where.warehouseId = warehouseId;

  const bins = await prisma.warehouseBin.findMany({ where, orderBy: { binLocation: 'asc' } });
  return NextResponse.json({ bins });
}

export async function POST(request: NextRequest) {
  try {
    const { warehouseId, productId, binLocation, quantity } = await request.json();

    if (!warehouseId || !productId || !binLocation) {
      return NextResponse.json({ error: 'warehouseId, productId, binLocation required' }, { status: 400 });
    }

    const bin = await prisma.warehouseBin.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      update: { binLocation, quantity: quantity ?? 0 },
      create: { warehouseId, productId, binLocation, quantity: quantity ?? 0 },
    });

    return NextResponse.json({ bin }, { status: 201 });
  } catch (error) {
    console.error('Bin create error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, binLocation, quantity } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const bin = await prisma.warehouseBin.update({
      where: { id },
      data: { ...(binLocation && { binLocation }), ...(quantity !== undefined && { quantity }) },
    });

    return NextResponse.json({ bin });
  } catch (error) {
    console.error('Bin update error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.warehouseBin.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
