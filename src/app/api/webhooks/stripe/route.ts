import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        const { stripe } = await import('@/lib/stripe');
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Parse raw body for testing/simulated mode
      if (!body || !body.trim()) {
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
      try {
        event = JSON.parse(body) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
      if (!event.type) {
        return NextResponse.json({ error: 'Missing event type' }, { status: 400 });
      }
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.order.updateMany({
          where: { paymentIntentId: paymentIntent.id },
          data: { status: 'CONFIRMED', paidAt: new Date() },
        });
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
        // Find order by payment intent
        const piId = typeof dispute.payment_intent === 'string'
          ? dispute.payment_intent
          : dispute.payment_intent?.id;

        if (piId) {
          const order = await prisma.order.findFirst({
            where: { paymentIntentId: piId },
          });
          if (order) {
            await prisma.dispute.create({
              data: {
                orderId: order.id,
                stripeDisputeId: dispute.id,
                amount: dispute.amount / 100,
                reason: dispute.reason || 'unknown',
                status: 'OPEN',
              },
            });
          }
        }
        break;
      }

      case 'charge.dispute.closed': {
        const closedDispute = event.data.object as Stripe.Dispute;
        const disputeStatus = closedDispute.status === 'won' ? 'WON' : 'LOST';
        await prisma.dispute.updateMany({
          where: { stripeDisputeId: closedDispute.id },
          data: {
            status: disputeStatus as 'WON' | 'LOST',
            resolvedAt: new Date(),
          },
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const refundPiId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (refundPiId) {
          const order = await prisma.order.findFirst({
            where: { paymentIntentId: refundPiId },
          });
          if (order) {
            // If fully refunded, update order status
            if (charge.amount_refunded >= charge.amount) {
              await prisma.order.update({
                where: { id: order.id },
                data: { status: 'REFUNDED' },
              });
            }
            // Update any pending refunds for this order to COMPLETED
            await prisma.refund.updateMany({
              where: { orderId: order.id, status: 'APPROVED' },
              data: { status: 'COMPLETED', updatedAt: new Date() },
            });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Check if this is a Prime subscription renewal
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;

        if (customerId && subscriptionId) {
          // Find user by metadata in subscription or customer
          const customerEmail = (invoice.customer_email) as string | null;
          if (customerEmail) {
            const user = await prisma.user.findUnique({ where: { email: customerEmail } });
            if (user) {
              const expiresAt = new Date();
              expiresAt.setMonth(expiresAt.getMonth() + 1);
              await prisma.membership.upsert({
                where: { userId: user.id },
                create: {
                  userId: user.id,
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
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
