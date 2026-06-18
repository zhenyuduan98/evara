import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    const userId = (session.user as { id: string }).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyTier: true },
    });

    const loyalty = await prisma.loyaltyPoints.findUnique({
      where: { userId },
    });

    const points = loyalty?.lifetimePoints ?? 0;
    const currentTier = user?.loyaltyTier ?? 'BRONZE';

    const allTiers = await prisma.loyaltyTierConfig.findMany({
      orderBy: { minPoints: 'asc' },
    });

    // Find next tier
    const currentTierConfig = allTiers.find((t) => t.tier === currentTier);
    const nextTier = allTiers.find((t) => t.minPoints > points);

    // Auto-upgrade if needed
    const qualifiedTier = [...allTiers].reverse().find((t) => points >= t.minPoints);
    if (qualifiedTier && qualifiedTier.tier !== currentTier) {
      await prisma.user.update({
        where: { id: userId },
        data: { loyaltyTier: qualifiedTier.tier },
      });
    }

    return successResponse({
      currentTier: qualifiedTier?.tier ?? currentTier,
      currentPoints: loyalty?.points ?? 0,
      lifetimePoints: points,
      pointMultiplier: currentTierConfig?.pointMultiplier ?? 1,
      benefits: currentTierConfig?.benefits ?? {},
      nextTier: nextTier
        ? {
            tier: nextTier.tier,
            pointsNeeded: nextTier.minPoints - points,
            minPoints: nextTier.minPoints,
          }
        : null,
      tiers: allTiers,
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
