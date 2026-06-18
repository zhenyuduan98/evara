import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get all escalation rules
    const rules = await prisma.escalationRule.findMany();

    if (rules.length === 0) {
      return NextResponse.json({ overdue: [], message: 'No escalation rules defined' });
    }

    const overdueTickets = [];

    for (const rule of rules) {
      const cutoff = new Date(Date.now() - rule.slaMinutes * 60 * 1000);
      const tickets = await prisma.ticket.findMany({
        where: {
          priority: rule.priority,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          createdAt: { lt: cutoff },
        },
        include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      });

      for (const ticket of tickets) {
        const escalateCutoff = new Date(Date.now() - rule.autoEscalateAfter * 60 * 1000);
        const shouldAutoEscalate = ticket.createdAt < escalateCutoff;

        if (shouldAutoEscalate && ticket.priority !== 'URGENT') {
          // Auto-escalate priority
          const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
          const currentIdx = priorities.indexOf(ticket.priority);
          const newPriority = priorities[Math.min(currentIdx + 1, 3)];

          await prisma.ticket.update({
            where: { id: ticket.id },
            data: { priority: newPriority },
          });
        }

        overdueTickets.push({
          ...ticket,
          rule: rule.name,
          slaMinutes: rule.slaMinutes,
          minutesOpen: Math.round((Date.now() - ticket.createdAt.getTime()) / 60000),
        });
      }
    }

    return NextResponse.json({ overdue: overdueTickets, count: overdueTickets.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch overdue tickets' }, { status: 500 });
  }
}
