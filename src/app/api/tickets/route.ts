import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = (session!.user as any).role === 'ADMIN';
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where: any = isAdmin ? {} : { userId };
  if (status) where.status = status;

  const tickets = await prisma.ticket.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, _count: { select: { messages: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let parsed: any;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { subject, category, priority, body } = parsed;

  if (!subject || !category || !body) {
    return NextResponse.json({ error: 'subject, category, and body are required' }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId,
      subject,
      category,
      priority: priority || 'MEDIUM',
      messages: {
        create: { senderId: userId, body, isStaff: false },
      },
    },
    include: { messages: true },
  });

  return NextResponse.json(ticket);
}
