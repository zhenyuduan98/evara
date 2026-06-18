import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const subtotal = parseFloat(searchParams.get('subtotal') || '0');
  const categoryId = searchParams.get('categoryId');

  const userCoupons = await prisma.userCoupon.findMany({
    where: {
      userId,
      usedAt: null,
      coupon: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    },
    include: { coupon: true },
  });

  const eligible = userCoupons.filter(uc => {
    const c = uc.coupon;
    if (c.minOrderAmount && subtotal < Number(c.minOrderAmount)) return false;
    if (c.maxUses && c.currentUses >= c.maxUses) return false;
    if (categoryId && c.categoryId && c.categoryId !== categoryId) return false;
    return true;
  });

  eligible.sort((a, b) => {
    const discA = a.coupon.type === 'PERCENTAGE' ? subtotal * Number(a.coupon.value) / 100 : Number(a.coupon.value);
    const discB = b.coupon.type === 'PERCENTAGE' ? subtotal * Number(b.coupon.value) / 100 : Number(b.coupon.value);
    return discB - discA;
  });

  return NextResponse.json({ bestCoupon: eligible[0] || null, eligibleCoupons: eligible });
}
