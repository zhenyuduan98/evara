import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.businessAccount.findUnique({
      where: { userId: session.user.id },
    });
    if (!account) {
      return NextResponse.json({ error: 'No business account' }, { status: 403 });
    }

    const { items, totalAmount, notes } = await request.json();
    if (!items || !totalAmount) {
      return NextResponse.json({ error: 'Items and totalAmount required' }, { status: 400 });
    }

    const po = await prisma.purchaseOrder.create({
      data: {
        businessAccountId: account.id,
        requestedBy: session.user.name || session.user.email || 'Unknown',
        items,
        totalAmount,
        notes: notes || null,
      },
    });

    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    console.error('Create PO error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.businessAccount.findUnique({
      where: { userId: session.user.id },
    });
    if (!account) {
      return NextResponse.json({ error: 'No business account' }, { status: 403 });
    }

    const orders = await prisma.purchaseOrder.findMany({
      where: { businessAccountId: account.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('List PO error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
