import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTrackingNumber, generateLabelUrl } from '@/lib/carriers';

export async function POST(request: NextRequest) {
  try {
    const { shipmentIds, carrier = 'UPS' } = await request.json();

    if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return NextResponse.json({ error: 'shipmentIds array required' }, { status: 400 });
    }

    const shipments = await prisma.shipment.findMany({
      where: { id: { in: shipmentIds } },
    });

    const labels = await Promise.all(
      shipments.map(async (shipment) => {
        const trackingNumber = generateTrackingNumber(carrier);
        const labelUrl = generateLabelUrl(carrier, trackingNumber);

        await prisma.shipment.update({
          where: { id: shipment.id },
          data: { trackingNumber, carrier, status: 'PACKED' },
        });

        const label = await prisma.shippingLabel.create({
          data: {
            shipmentId: shipment.id,
            carrier,
            trackingNumber,
            labelUrl,
          },
        });

        return label;
      })
    );

    return NextResponse.json({ labels, count: labels.length });
  } catch (error) {
    console.error('Batch labels error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
