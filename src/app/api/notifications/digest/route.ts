import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // Optional API key auth for cron
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find users with unread notifications
  const usersWithUnread = await prisma.notification.groupBy({
    by: ['userId'],
    where: { read: false },
    _count: { id: true },
    having: { id: { _count: { gte: 1 } } },
  });

  const digests = [];

  for (const group of usersWithUnread) {
    const notifications = await prisma.notification.findMany({
      where: { userId: group.userId, read: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const user = await prisma.user.findUnique({
      where: { id: group.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user?.email) continue;

    // Build digest summary
    const byCategory: Record<string, number> = {};
    for (const n of notifications) {
      const cat = n.category || n.type;
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    const summaryLines = Object.entries(byCategory)
      .map(([cat, count]) => `• ${cat}: ${count} notification${count > 1 ? 's' : ''}`)
      .join('\n');

    const digestBody = `Hi ${user.name || 'there'},\n\nYou have ${notifications.length} unread notification${notifications.length > 1 ? 's' : ''}:\n\n${summaryLines}\n\nVisit your dashboard to view details.`;

    // Create digest notification record
    const digest = await prisma.notification.create({
      data: {
        userId: group.userId,
        type: 'EMAIL',
        title: `Notification Digest: ${notifications.length} unread`,
        body: digestBody,
        category: 'digest',
      },
    });

    digests.push({ userId: group.userId, email: user.email, count: notifications.length, digestId: digest.id });
  }

  return NextResponse.json({ processed: digests.length, digests });
}
