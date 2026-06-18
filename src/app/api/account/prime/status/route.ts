import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const GRACE_PERIOD_DAYS = 7;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const membership = await prisma.membership.findUnique({ where: { userId } });

    if (!membership) {
      return NextResponse.json({ tier: 'FREE', active: false, canRenew: false });
    }

    const now = new Date();
    const isExpired = membership.expiresAt && membership.expiresAt < now;
    const graceEnd = membership.expiresAt
      ? new Date(membership.expiresAt.getTime() + GRACE_PERIOD_DAYS * 86400000)
      : null;
    const inGracePeriod = isExpired && graceEnd && now < graceEnd;

    return NextResponse.json({
      tier: membership.tier,
      expiresAt: membership.expiresAt,
      active: !isExpired,
      expired: !!isExpired,
      inGracePeriod: !!inGracePeriod,
      canRenew: !!inGracePeriod,
      graceEndsAt: graceEnd,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
