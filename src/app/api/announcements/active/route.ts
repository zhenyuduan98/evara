import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const now = new Date();
  const announcements = await prisma.platformAnnouncement.findMany({
    where: {
      isActive: true,
      startAt: { lte: now },
      OR: [{ endAt: null }, { endAt: { gte: now } }],
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return NextResponse.json(announcements);
}
