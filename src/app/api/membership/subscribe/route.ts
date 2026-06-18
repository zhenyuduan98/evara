import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const tierBenefits: Record<string, Record<string, boolean>> = {
  FREE: { standardShipping: true },
  PRIME: { freeShipping: true, primeVideo: true, primeMusic: true, primeReading: true, exclusiveDeals: true },
  PRIME_PLUS: { freeShipping: true, sameDayDelivery: true, primeVideo: true, primeMusic: true, primeReading: true, exclusiveDeals: true, groceryDelivery: true, primeWardrobe: true },
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tier } = await req.json();
  if (!['FREE', 'PRIME', 'PRIME_PLUS'].includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const userId = (session.user as { id?: string }).id!;
  const expiresAt = tier === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const membership = await prisma.membership.upsert({
    where: { userId },
    update: { tier, expiresAt, benefits: tierBenefits[tier] },
    create: { userId, tier, expiresAt, benefits: tierBenefits[tier] },
  });

  return NextResponse.json({ membership });
}
