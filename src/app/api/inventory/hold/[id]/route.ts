import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hold = await prisma.inventoryHold.findUnique({
      where: { id: params.id },
    });

    if (!hold) {
      return NextResponse.json({ error: 'Hold not found' }, { status: 404 });
    }

    await prisma.inventoryHold.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete hold error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
