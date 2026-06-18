import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const unreadOnly = searchParams.get('unread') === 'true';
  const category = searchParams.get('category');

  const where = {
    userId: session.user.id,
    ...(unreadOnly ? { read: false } : {}),
    ...(category ? { category } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: session.user.id, read: false } }),
  ]);

  return NextResponse.json({ notifications, total, unreadCount });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 });
    }
    const { userId, type, title, body: notifBody, link } = body;

    if (!type || !title || !notifBody) {
      return NextResponse.json({ error: 'type, title, and body are required' }, { status: 400 });
    }

    const targetUserId = userId || session.user.id;

    const notification = await prisma.notification.create({
      data: { userId: targetUserId, type, title, body: notifBody, link },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
