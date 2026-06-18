import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.shipment.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

    const body = await request.json();
    const { carrier } = body || {};

    const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const shipment = await prisma.shipment.update({
      where: { id: params.id },
      data: {
        status: 'SHIPPED',
        carrier: carrier || 'USPS',
        trackingNumber,
        shippedAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: 'SHIPPED',
        location: 'Warehouse',
        description: `Package shipped via ${carrier || 'USPS'}`,
      },
    });

    return NextResponse.json(shipment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
