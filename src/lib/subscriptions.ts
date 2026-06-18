import prisma from '@/lib/prisma';
import { SubscriptionFrequency } from '@prisma/client';

export function calculateDiscount(itemCount: number): number {
  if (itemCount >= 5) return 15;
  if (itemCount >= 3) return 10;
  return 5;
}

function getNextDeliveryDate(from: Date, frequency: SubscriptionFrequency): Date {
  const next = new Date(from);
  switch (frequency) {
    case 'WEEKLY': next.setDate(next.getDate() + 7); break;
    case 'BIWEEKLY': next.setDate(next.getDate() + 14); break;
    case 'MONTHLY': next.setMonth(next.getMonth() + 1); break;
    case 'BIMONTHLY': next.setMonth(next.getMonth() + 2); break;
    case 'QUARTERLY': next.setMonth(next.getMonth() + 3); break;
  }
  return next;
}

export { getNextDeliveryDate };

export async function processSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { product: true, user: true },
  });

  if (!subscription || subscription.status !== 'ACTIVE') {
    throw new Error('Subscription not found or not active');
  }

  const discount = Number(subscription.discountPercent);
  const price = Number(subscription.product.price);
  const discountedPrice = price * (1 - discount / 100);
  const subtotal = discountedPrice * subscription.quantity;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Create subscription order record
  const subOrder = await prisma.subscriptionOrder.create({
    data: {
      subscriptionId: subscription.id,
      scheduledDate: subscription.nextDelivery,
      processedAt: new Date(),
      status: 'PROCESSED',
    },
  });

  // Update next delivery date
  const nextDelivery = getNextDeliveryDate(subscription.nextDelivery, subscription.frequency);
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { nextDelivery },
  });

  return { subOrder, nextDelivery, total };
}
