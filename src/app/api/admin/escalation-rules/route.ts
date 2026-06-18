import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, priority, slaMinutes, autoEscalateAfter, assignToRole } = body;

    if (!name || !priority || !slaMinutes || !autoEscalateAfter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rule = await prisma.escalationRule.create({
      data: { name, priority, slaMinutes, autoEscalateAfter, assignToRole },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create escalation rule' }, { status: 500 });
  }
}

export async function GET() {
  const rules = await prisma.escalationRule.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(rules);
}
