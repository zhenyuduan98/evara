import prisma from '@/lib/prisma';

export async function seedLoyaltyTiers() {
  const tiers = [
    { tier: 'BRONZE' as const, minPoints: 0, pointMultiplier: 1.0, benefits: { freeShipping: false, earlyAccess: false } },
    { tier: 'SILVER' as const, minPoints: 1000, pointMultiplier: 1.5, benefits: { freeShipping: false, earlyAccess: true } },
    { tier: 'GOLD' as const, minPoints: 5000, pointMultiplier: 2.0, benefits: { freeShipping: true, earlyAccess: true } },
    { tier: 'PLATINUM' as const, minPoints: 20000, pointMultiplier: 3.0, benefits: { freeShipping: true, earlyAccess: true, prioritySupport: true } },
  ];

  for (const t of tiers) {
    await prisma.loyaltyTierConfig.upsert({
      where: { tier: t.tier },
      update: { minPoints: t.minPoints, pointMultiplier: t.pointMultiplier, benefits: t.benefits },
      create: t,
    });
  }
}
