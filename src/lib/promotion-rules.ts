import prisma from '@/lib/prisma';

interface StackingValidation {
  valid: boolean;
  error?: string;
  appliedCoupons: string[];
  appliedDeals: string[];
}

export async function validatePromotionStacking(
  couponIds: string[],
  dealIds: string[],
  categoryIds: string[] = []
): Promise<StackingValidation> {
  // Get the active promotion rule (use most recent active one)
  const rule = await prisma.promotionRule.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  // Default: allow 1 coupon, 1 deal, no stacking
  const maxCoupons = rule?.maxCoupons ?? 1;
  const maxDeals = rule?.maxDeals ?? 1;
  const allowStacking = rule?.allowStacking ?? false;
  const excludeCategories = (rule?.excludeCategories as string[]) || [];

  // Check excluded categories
  if (excludeCategories.length > 0 && categoryIds.length > 0) {
    const blocked = categoryIds.filter((c) => excludeCategories.includes(c));
    if (blocked.length > 0) {
      return {
        valid: false,
        error: `Promotions not available for categories: ${blocked.join(', ')}`,
        appliedCoupons: [],
        appliedDeals: [],
      };
    }
  }

  // Check stacking
  if (!allowStacking && couponIds.length > 0 && dealIds.length > 0) {
    return {
      valid: false,
      error: 'Cannot combine coupons and deals. Promotion stacking is not allowed.',
      appliedCoupons: [],
      appliedDeals: [],
    };
  }

  // Check limits
  if (couponIds.length > maxCoupons) {
    return {
      valid: false,
      error: `Maximum ${maxCoupons} coupon(s) allowed per order`,
      appliedCoupons: [],
      appliedDeals: [],
    };
  }

  if (dealIds.length > maxDeals) {
    return {
      valid: false,
      error: `Maximum ${maxDeals} deal(s) allowed per order`,
      appliedCoupons: [],
      appliedDeals: [],
    };
  }

  return {
    valid: true,
    appliedCoupons: couponIds.slice(0, maxCoupons),
    appliedDeals: dealIds.slice(0, maxDeals),
  };
}
