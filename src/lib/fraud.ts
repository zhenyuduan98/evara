import { prisma } from '@/lib/prisma';

interface FraudFactors {
  highAmount: number;
  newAccount: number;
  addressMismatch: number;
  velocity: number;
  multiplePaymentMethods: number;
}

interface OrderForScoring {
  id: string;
  userId: string;
  total: number | { toNumber?: () => number };
  shippingAddressId: string;
}

export async function scoreOrder(order: OrderForScoring): Promise<{ score: number; factors: FraudFactors; flagged: boolean }> {
  const factors: FraudFactors = {
    highAmount: 0,
    newAccount: 0,
    addressMismatch: 0,
    velocity: 0,
    multiplePaymentMethods: 0,
  };

  const total = typeof order.total === 'object' && order.total?.toNumber ? order.total.toNumber() : Number(order.total);

  // High amount check (+20)
  if (total > 500) factors.highAmount = 20;
  else if (total > 200) factors.highAmount = 10;

  // New account check (+15)
  const user = await prisma.user.findUnique({ where: { id: order.userId } });
  if (user) {
    const accountAge = Date.now() - user.createdAt.getTime();
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) factors.newAccount = 15;
    else if (daysSinceCreation < 7) factors.newAccount = 10;
  }

  // Address mismatch (+25) - check if shipping address matches user's default
  if (user) {
    const defaultAddr = await prisma.address.findFirst({ where: { userId: user.id, isDefault: true } });
    if (defaultAddr && defaultAddr.id !== order.shippingAddressId) {
      factors.addressMismatch = 25;
    }
  }

  // Velocity check (+30) - multiple orders in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentOrders = await prisma.order.count({
    where: { userId: order.userId, createdAt: { gte: oneHourAgo } },
  });
  if (recentOrders >= 5) factors.velocity = 30;
  else if (recentOrders >= 3) factors.velocity = 15;

  // Multiple payment methods (+10) - check distinct payment intents
  const distinctPayments = await prisma.order.findMany({
    where: { userId: order.userId, paymentIntentId: { not: null } },
    select: { paymentIntentId: true },
    distinct: ['paymentIntentId'],
    take: 10,
  });
  if (distinctPayments.length >= 3) factors.multiplePaymentMethods = 10;

  const score = Object.values(factors).reduce((a, b) => a + b, 0);
  const flagged = score >= 50;

  // Save to DB
  await prisma.fraudScore.create({
    data: {
      orderId: order.id,
      score,
      factors: factors as Record<string, unknown>,
      flagged,
    },
  });

  return { score, factors, flagged };
}
