import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId, content } = await req.json();
  if (!sessionId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const chatSession = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!chatSession || chatSession.status === 'CLOSED') {
    return NextResponse.json({ error: 'Session not found or closed' }, { status: 404 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      sessionId,
      senderId: session.user.id,
      senderType: 'USER',
      content,
    },
  });

  // Auto-reply: search help articles for FAQ match
  const words = content.split(/\s+/).filter((w: string) => w.length > 3);
  if (words.length > 0) {
    const articles = await prisma.helpArticle.findMany({
      where: {
        publishedAt: { not: null },
        OR: words.slice(0, 5).map((w: string) => ({
          OR: [
            { title: { contains: w, mode: 'insensitive' as const } },
            { body: { contains: w, mode: 'insensitive' as const } },
          ],
        })),
      },
      take: 3,
      select: { title: true, slug: true },
    });

    if (articles.length > 0) {
      const links = articles.map((a) => `• ${a.title} (/help/${a.slug})`).join('\n');
      await prisma.chatMessage.create({
        data: {
          sessionId,
          senderId: session.user.id,
          senderType: 'BOT',
          content: `I found some articles that might help:\n${links}\n\nAn agent will be with you shortly.`,
        },
      });
    }
  }

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ message, messages });
}
