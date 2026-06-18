import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userCoupons = await prisma.userCoupon.findMany({
    where: { userId },
    include: { coupon: true },
    orderBy: { claimedAt: 'desc' },
  });

  return NextResponse.json({ userCoupons });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { couponId } = await request.json();

  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon || !coupon.isActive) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });

  const existing = await prisma.userCoupon.findUnique({
    where: { userId_couponId: { userId, couponId } },
  });
  if (existing) return NextResponse.json({ error: 'Already clipped' }, { status: 400 });

  const userCoupon = await prisma.userCoupon.create({
    data: { userId, couponId },
    include: { coupon: true },
  });

  return NextResponse.json({ userCoupon });
}
