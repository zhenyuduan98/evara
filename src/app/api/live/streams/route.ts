import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellerId, title, description, scheduledAt, thumbnailUrl } = body;

    if (!sellerId || !title || !scheduledAt) {
      return NextResponse.json({ error: 'sellerId, title, and scheduledAt are required' }, { status: 400 });
    }

    const stream = await prisma.liveStream.create({
      data: {
        sellerId,
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        thumbnailUrl,
      },
      include: { seller: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(stream, { status: 201 });
  } catch (error) {
    console.error('Error creating live stream:', error);
    return NextResponse.json({ error: 'Failed to create live stream' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status: status as 'SCHEDULED' | 'LIVE' | 'ENDED' } : {};

    const streams = await prisma.liveStream.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, image: true } },
        _count: { select: { products: true, comments: true } },
      },
      orderBy: [
        { status: 'asc' },
        { scheduledAt: 'desc' },
      ],
    });

    return NextResponse.json(streams);
  } catch (error) {
    console.error('Error listing live streams:', error);
    return NextResponse.json({ error: 'Failed to list streams' }, { status: 500 });
  }
}
