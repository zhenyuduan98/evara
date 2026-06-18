import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

const PRIME_PRICE_ID = process.env.STRIPE_PRIME_PRICE_ID || 'price_prime_monthly';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);

    const userId = (session.user as { id: string }).id;
    const body = await req.json().catch(() => ({}));
    const { paymentMethodId } = body as { paymentMethodId?: string };

    let subscriptionId: string | null = null;
    let clientSecret: string | null = null;
    let realStripe = false;

    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const { stripe } = await import('@/lib/stripe');

        const user = await prisma.user.findUnique({ where: { id: userId } });
        let stripeCustomerId = (user as Record<string, unknown>)?.stripeCustomerId as string | undefined;

        // Create Stripe customer if needed
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: user?.email || undefined,
            metadata: { userId },
          });
          stripeCustomerId = customer.id;
        }

        // Attach payment method if provided
        let stripePM: string | undefined;
        if (paymentMethodId) {
          const savedPM = await prisma.paymentMethod.findFirst({
            where: { id: paymentMethodId, userId },
          });
          stripePM = savedPM?.stripePaymentMethodId || undefined;
        }

        const subscriptionData: Record<string, unknown> = {
          customer: stripeCustomerId,
          items: [{ price: PRIME_PRICE_ID }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        };
        if (stripePM) {
          subscriptionData.default_payment_method = stripePM;
        }

        const subscription = await stripe.subscriptions.create(
          subscriptionData as Parameters<typeof stripe.subscriptions.create>[0]
        );
        subscriptionId = subscription.id;
        // Extract client secret from expanded invoice
        const invoice = subscription.latest_invoice as { payment_intent?: { client_secret?: string } } | null;
        clientSecret = invoice?.payment_intent?.client_secret || null;
        realStripe = true;
      } catch (stripeError) {
        console.warn('Stripe subscription failed, using simulated fallback:', stripeError);
      }
    }

    // Simulated fallback
    if (!realStripe) {
      subscriptionId = `sub_simulated_${Date.now()}`;
    }

    // Upsert membership
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const membership = await prisma.membership.upsert({
      where: { userId },
      create: {
        userId,
        tier: 'PRIME',
        expiresAt,
        benefits: { subscriptionId, freeShipping: true, primeVideo: true },
      },
      update: {
        tier: 'PRIME',
        expiresAt,
        benefits: { subscriptionId, freeShipping: true, primeVideo: true },
      },
    });

    return successResponse({ membership, subscriptionId, clientSecret, realStripe }, 201);
  } catch (error) {
    console.error('Prime subscribe error:', error);
    return errorResponse('Internal server error', 500);
  }
}
