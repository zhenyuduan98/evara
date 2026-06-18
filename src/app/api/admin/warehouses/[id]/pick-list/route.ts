import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const warehouseId = params.id;
    const body = await request.json();
    const { assignedTo } = body || {};

    // Find pending orders that don't have pick lists yet
    const pendingOrders = await prisma.order.findMany({
      where: { status: 'PENDING' },
      include: { items: { include: { product: true } } },
      take: 20,
    });

    if (pendingOrders.length === 0) {
      return NextResponse.json({ message: 'No pending orders to pick' }, { status: 200 });
    }

    const pickLists = await Promise.all(
      pendingOrders.map((order) =>
        prisma.pickList.create({
          data: {
            warehouseId,
            orderId: order.id,
            status: 'PENDING',
            assignedTo: assignedTo || null,
            items: order.items.map((item) => ({
              productId: item.productId,
              title: item.title,
              quantity: item.quantity,
              sku: item.product.sku,
            })),
          },
        })
      )
    );

    return NextResponse.json({ pickLists, count: pickLists.length }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
