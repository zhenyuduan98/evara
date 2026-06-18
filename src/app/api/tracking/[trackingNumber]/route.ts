import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber: params.trackingNumber },
      include: {
        trackingEvents: { orderBy: { timestamp: 'desc' } },
        warehouse: { select: { name: true, city: true, state: true } },
      },
    });
    if (!shipment) return errorResponse('Shipment not found', 404);

    const order = await prisma.order.findFirst({
      where: { id: shipment.orderId },
      select: { orderNumber: true, shippingAddress: { select: { city: true, state: true } } },
    });

    return successResponse({
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
      orderNumber: order?.orderNumber,
      destination: order?.shippingAddress ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : null,
      origin: shipment.warehouse ? `${shipment.warehouse.city}, ${shipment.warehouse.state}` : null,
      events: shipment.trackingEvents,
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return errorResponse('Failed to fetch tracking', 500);
  }
}
