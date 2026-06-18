import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse('Unauthorized', 401);

    const { userId, amount, reason, orderId, expiresAt } = await req.json();
    if (!userId || !amount || !reason) {
      return errorResponse('userId, amount, and reason are required');
    }

    const credit = await prisma.storeCredit.create({
      data: {
        userId,
        amount,
        reason,
        issuedBy: admin.user?.email || 'admin',
        orderId: orderId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return successResponse({ credit }, 201);
  } catch (error) {
    console.error('Store credit error:', error);
    return errorResponse('Internal server error', 500);
  }
}
