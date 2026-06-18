import prisma from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);
    const returns = await prisma.returnRequest.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse({ returns });
  } catch (error) {
    console.error('Returns error:', error);
    return errorResponse('Failed to fetch returns', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);
    const { id, status, adminNote } = await request.json();
    if (!id || !status) return errorResponse('ID and status required');
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: { status, ...(adminNote !== undefined ? { adminNote } : {}) },
    });
    return successResponse(updated);
  } catch (error) {
    console.error('Update return error:', error);
    return errorResponse('Failed to update return', 500);
  }
}
