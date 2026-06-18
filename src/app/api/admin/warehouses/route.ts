import prisma from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);
    const warehouses = await prisma.warehouse.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse({ warehouses });
  } catch (error) {
    console.error('Warehouses error:', error);
    return errorResponse('Failed to fetch warehouses', 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);
    const { name, address, city, state, zipCode } = await request.json();
    if (!name || !address || !city || !state || !zipCode) return errorResponse('All fields required');
    const warehouse = await prisma.warehouse.create({ data: { name, address, city, state, zipCode } });
    return successResponse(warehouse, 201);
  } catch (error) {
    console.error('Create warehouse error:', error);
    return errorResponse('Failed to create warehouse', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return errorResponse('Unauthorized', 401);
    const { id, ...data } = await request.json();
    if (!id) return errorResponse('ID required');
    const warehouse = await prisma.warehouse.update({ where: { id }, data });
    return successResponse(warehouse);
  } catch (error) {
    console.error('Update warehouse error:', error);
    return errorResponse('Failed to update warehouse', 500);
  }
}
