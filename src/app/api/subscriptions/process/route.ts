import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processSubscription } from '@/lib/subscriptions';

export async function POST(req: NextRequest) {
  // Simple auth check for cron - check for secret header
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'cron-secret';
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextDelivery: { lte: new Date() },
    },
  });

  const results = [];
  for (const sub of dueSubscriptions) {
    try {
      const result = await processSubscription(sub.id);
      results.push({ id: sub.id, status: 'processed', ...result });
    } catch (error) {
      results.push({ id: sub.id, status: 'error', error: String(error) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
