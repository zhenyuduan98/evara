import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: { businessAccount: true },
    });

    if (!po) {
      return NextResponse.json({ error: 'PO not found' }, { status: 404 });
    }
    if (po.businessAccount.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (po.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({ error: 'PO is not pending approval' }, { status: 400 });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedBy: session.user.name || session.user.email || 'Unknown',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Approve PO error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
