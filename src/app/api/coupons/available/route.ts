import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
    orderBy: { createdAt: 'desc' },
  });

  // Filter out fully used coupons
  const available = coupons.filter(c => !c.maxUses || c.currentUses < c.maxUses);

  return NextResponse.json({ coupons: available });
}
