import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, eventData, page, sessionId, userId } = body;

    if (!eventType || !page) {
      return NextResponse.json({ error: 'eventType and page are required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;

    const event = await prisma.analyticsEvent.create({
      data: {
        eventType,
        eventData: eventData || {},
        page,
        sessionId: sessionId || 'anonymous',
        userId: userId || undefined,
        ip,
      },
    });

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    console.error('Analytics event error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
