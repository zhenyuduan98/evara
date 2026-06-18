import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTrackingNumber, generateLabelUrl } from '@/lib/carriers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const carrier = body.carrier || 'USPS';

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    const trackingNumber = generateTrackingNumber(carrier);
    const labelUrl = generateLabelUrl(carrier, trackingNumber);

    const label = await prisma.shippingLabel.create({
      data: {
        shipmentId: id, // using return request id as reference
        carrier,
        trackingNumber,
        labelUrl,
      },
    });

    return NextResponse.json({ label });
  } catch (error) {
    console.error('Return label error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
