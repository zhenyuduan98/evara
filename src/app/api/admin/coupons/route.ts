import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  if (!(await requireAdmin())) return errorResponse('Forbidden', 403);
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return successResponse(coupons);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return errorResponse('Forbidden', 403);
  const data = await req.json();
  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrderAmount: data.minOrderAmount || null,
      maxUses: data.maxUses || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive ?? true,
    },
  });
  return successResponse(coupon, 201);
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return errorResponse('Forbidden', 403);
  const data = await req.json();
  if (!data.id) return errorResponse('Coupon id required');
  const coupon = await prisma.coupon.update({
    where: { id: data.id },
    data: {
      ...(data.code && { code: data.code.toUpperCase() }),
      ...(data.type && { type: data.type }),
      ...(data.value !== undefined && { value: data.value }),
      ...(data.minOrderAmount !== undefined && { minOrderAmount: data.minOrderAmount }),
      ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
      ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
  return successResponse(coupon);
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return errorResponse('Forbidden', 403);
  const { id } = await req.json();
  if (!id) return errorResponse('Coupon id required');
  await prisma.coupon.delete({ where: { id } });
  return successResponse({ deleted: true });
}
