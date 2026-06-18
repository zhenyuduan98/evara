import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const STATUS_MAP: Record<string, string> = {
  'picked_up': 'SHIPPED',
  'in_transit': 'IN_TRANSIT',
  'out_for_delivery': 'IN_TRANSIT',
  'delivered': 'DELIVERED',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingNumber, carrier, status, timestamp, location } = body;

    if (!trackingNumber || !status) {
      return NextResponse.json({ error: 'Missing trackingNumber or status' }, { status: 400 });
    }

    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const mappedStatus = STATUS_MAP[status] || status;

    const updates: Record<string, unknown> = { status: mappedStatus };
    if (mappedStatus === 'SHIPPED' && !shipment.shippedAt) {
      updates.shippedAt = new Date(timestamp || Date.now());
    }
    if (mappedStatus === 'DELIVERED') {
      updates.deliveredAt = new Date(timestamp || Date.now());
    }

    await prisma.shipment.update({
      where: { id: shipment.id },
      data: updates,
    });

    await prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: mappedStatus,
        location: location || '',
        description: `Carrier update: ${status}`,
        timestamp: new Date(timestamp || Date.now()),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
