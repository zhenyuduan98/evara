import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPushNotification, PushPayload } from '@/lib/web-push';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId, title, body, url, tag } = await req.json();
  const targetUserId = userId || session.user.id;

  if (!title || !body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: targetUserId },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
  }

  const payload: PushPayload = { title, body, url, tag };
  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const keys = sub.keys as { p256dh: string; auth: string };
      const result = await sendPushNotification({ endpoint: sub.endpoint, keys }, payload);
      if (result.expired) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
      return result;
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  return NextResponse.json({ sent, total: subscriptions.length });
}
