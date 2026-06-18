import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial unread count
      const unreadCount = await prisma.notification.count({
        where: { userId, read: false },
      });
      send({ type: 'init', unreadCount });

      // Poll for new notifications every 3 seconds
      let lastCheck = new Date();
      const interval = setInterval(async () => {
        try {
          const newNotifications = await prisma.notification.findMany({
            where: { userId, createdAt: { gt: lastCheck } },
            orderBy: { createdAt: 'desc' },
          });

          if (newNotifications.length > 0) {
            const unread = await prisma.notification.count({
              where: { userId, read: false },
            });
            send({ type: 'new', notifications: newNotifications, unreadCount: unread });
            lastCheck = new Date();
          }
        } catch {
          // Connection may be closed
        }
      }, 3000);

      // Keep alive ping every 30s
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          // ignore
        }
      }, 30000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
