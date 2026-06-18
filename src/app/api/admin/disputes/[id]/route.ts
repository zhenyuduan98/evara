import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse('Unauthorized', 401);

    const { status, evidence } = await req.json();

    const dispute = await prisma.dispute.findUnique({ where: { id: params.id } });
    if (!dispute) return errorResponse('Dispute not found', 404);

    const data: Record<string, unknown> = {};
    if (evidence) data.evidence = evidence;
    if (status && ['OPEN', 'WON', 'LOST'].includes(status)) {
      data.status = status;
      if (status !== 'OPEN') data.resolvedAt = new Date();
    }

    const updated = await prisma.dispute.update({
      where: { id: params.id },
      data,
      include: { order: { select: { orderNumber: true, total: true } } },
    });

    return successResponse({ dispute: updated });
  } catch (error) {
    console.error('Dispute update error:', error);
    return errorResponse('Internal server error', 500);
  }
}
