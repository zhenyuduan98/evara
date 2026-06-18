import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as webpush from 'web-push';

function getWebPush() {
  const pub = process.env.NEXT_PUBLIC_VAPID_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (pub && priv) {
    webpush.setVapidDetails('mailto:admin@example.com', pub, priv);
  }
  return webpush;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: { product: { select: { title: true, price: true } } },
  });

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  }

  const subscriptions = await prisma.pushSubscription.findMany();

  const payload = JSON.stringify({
    title: '🔥 Deal Alert!',
    body: `${deal.product.title} - ${deal.discountPercent}% off!`,
    url: `/deals/${deal.id}`,
  });

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await getWebPush().sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          payload
        );
        sent++;
      } catch {
        failed++;
        // Remove invalid subscriptions (410 Gone)
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    })
  );

  return NextResponse.json({ sent, failed, total: subscriptions.length });
}
