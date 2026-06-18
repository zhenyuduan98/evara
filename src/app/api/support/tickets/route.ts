import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Round-robin: assign to least-loaded agent (ADMIN users with fewest open tickets)
async function assignToLeastLoadedAgent(): Promise<string | null> {
  const agents = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      _count: {
        select: {
          tickets: { where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } },
        },
      },
    },
    orderBy: { tickets: { _count: 'asc' } },
    take: 1,
  });

  return agents[0]?.id || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subject, category, priority } = body;

    if (!userId || !subject || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const assignedTo = await assignToLeastLoadedAgent();

    // Calculate SLA deadline from escalation rules
    let slaDeadline: Date | undefined;
    const rule = await prisma.escalationRule.findFirst({
      where: { priority: priority || 'MEDIUM' },
    });
    if (rule) {
      slaDeadline = new Date(Date.now() + rule.slaMinutes * 60 * 1000);
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId,
        subject,
        category,
        priority: priority || 'MEDIUM',
        assignedTo,
        slaDeadline,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const status = req.nextUrl.searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;

  const tickets = await prisma.ticket.findMany({
    where,
    include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tickets);
}
