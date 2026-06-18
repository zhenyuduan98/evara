import prisma from '@/lib/prisma';

/**
 * Check if an ad has remaining daily budget before allowing a bid/impression charge.
 */
export async function enforceAdDailyBudget(sponsoredProductId: string, chargeAmount: number): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ad = await prisma.sponsoredProduct.findUnique({
    where: { id: sponsoredProductId },
  });

  if (!ad || !ad.isActive) return false;

  // Sum today's spend from bids
  const todaySpend = await prisma.adBid.aggregate({
    where: {
      sponsoredProductId,
      createdAt: { gte: today },
    },
    _sum: { spent: true },
  });

  const spent = Number(todaySpend._sum.spent || 0);
  const budget = Number(ad.dailyBudget);

  return spent + chargeAmount <= budget;
}

/**
 * Record an ad impression and increment counter.
 */
export async function recordAdImpression(sponsoredProductId: string, userId?: string, page: string = 'search') {
  await prisma.$transaction([
    prisma.adImpression.create({
      data: { sponsoredProductId, userId, page },
    }),
    prisma.sponsoredProduct.update({
      where: { id: sponsoredProductId },
      data: { impressions: { increment: 1 } },
    }),
  ]);
}
