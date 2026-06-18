import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sponsoredProductId, userId, type, page } = body;

    if (!sponsoredProductId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'impression') {
      await prisma.adImpression.create({
        data: { sponsoredProductId, userId, page: page || 'unknown' },
      });
    } else if (type === 'click') {
      await prisma.adClick.create({
        data: { sponsoredProductId, userId },
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
