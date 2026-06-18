import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.shipment.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

    const shipment = await prisma.shipment.update({
      where: { id: params.id },
      data: { status: 'PACKED' },
    });
    return NextResponse.json(shipment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
