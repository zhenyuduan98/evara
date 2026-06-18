import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/web-push';

function resolveTemplate(body: string, variables: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { templateName, userId, variables = {}, locale } = await req.json();
  if (!templateName) return NextResponse.json({ error: 'templateName required' }, { status: 400 });

  const targetUserId = userId || session.user.id;

  // Resolve user locale
  const userLocale = locale || 'en';

  // Find template for locale, fallback to 'en'
  let template = await prisma.notificationTemplate.findFirst({
    where: { name: templateName, locale: userLocale },
  });
  if (!template && userLocale !== 'en') {
    template = await prisma.notificationTemplate.findFirst({
      where: { name: templateName, locale: 'en' },
    });
  }
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const resolvedBody = resolveTemplate(template.body, variables);
  const resolvedSubject = template.subject ? resolveTemplate(template.subject, variables) : templateName;

  // Create in-app notification
  const notification = await prisma.notification.create({
    data: {
      userId: targetUserId,
      type: template.channel,
      title: resolvedSubject,
      body: resolvedBody,
      category: templateName,
    },
  });

  // If PUSH channel, send push notifications
  if (template.channel === 'PUSH') {
    const subs = await prisma.pushSubscription.findMany({ where: { userId: targetUserId } });
    for (const sub of subs) {
      const keys = sub.keys as { p256dh: string; auth: string };
      try {
        const result = await sendPushNotification({ endpoint: sub.endpoint, keys }, {
          title: resolvedSubject,
          body: resolvedBody,
        });
        if (result.expired) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      } catch (_) { /* ignore individual failures */ }
    }
  }

  return NextResponse.json({ notification }, { status: 201 });
}
