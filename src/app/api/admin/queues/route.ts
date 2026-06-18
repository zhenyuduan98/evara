import { NextResponse } from 'next/server';
import { emailQueue, notificationQueue, inventoryQueue, getQueueStats } from '@/lib/queue';

export async function GET() {
  try {
    const [email, notification, inventory] = await Promise.all([
      getQueueStats(emailQueue),
      getQueueStats(notificationQueue),
      getQueueStats(inventoryQueue),
    ]);

    return NextResponse.json({
      queues: {
        email,
        notification,
        inventory,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch queue stats', details: String(error) },
      { status: 500 },
    );
  }
}
