import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSeller } from '@/lib/seller-auth';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const auth = await requireSeller();
    if ('error' in auth && !('seller' in auth)) return auth.error;
    const { seller } = auth as { seller: { id: string } };

    const members = await prisma.sellerTeamMember.findMany({
      where: { sellerId: seller.id },
    });
    return successResponse({ members });
  } catch (error) {
    console.error('Team list error:', error);
    return errorResponse('Failed to list team', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSeller();
    if ('error' in auth && !('seller' in auth)) return auth.error;
    const { seller } = auth as { seller: { id: string } };

    const { userId, role } = await request.json();
    if (!userId) return errorResponse('userId is required');
    if (role && !['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'].includes(role)) return errorResponse('Invalid role');

    const member = await prisma.sellerTeamMember.create({
      data: { sellerId: seller.id, userId, role: role || 'VIEWER' },
    });
    return successResponse({ member }, 201);
  } catch (error) {
    console.error('Team invite error:', error);
    return errorResponse('Failed to invite team member', 500);
  }
}
