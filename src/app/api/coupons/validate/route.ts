import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const { code, orderAmount } = await req.json();
  if (!code) return errorResponse('Coupon code is required');

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) return errorResponse('Invalid coupon code', 404);
  if (!coupon.isActive) return errorResponse('Coupon is inactive');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return errorResponse('Coupon has expired');
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) return errorResponse('Coupon usage limit reached');
  if (coupon.minOrderAmount && orderAmount && Number(orderAmount) < Number(coupon.minOrderAmount)) {
    return errorResponse(`Minimum order amount is $${coupon.minOrderAmount}`);
  }

  const discount = coupon.type === 'PERCENTAGE'
    ? orderAmount ? Number(orderAmount) * Number(coupon.value) / 100 : Number(coupon.value)
    : Number(coupon.value);

  return successResponse({ coupon, discount: Math.round(discount * 100) / 100 });
}
