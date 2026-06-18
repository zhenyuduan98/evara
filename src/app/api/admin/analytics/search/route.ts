import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const searchEvents = await prisma.analyticsEvent.findMany({
    where: { eventType: 'search', createdAt: { gte: startDate } },
    select: { eventData: true },
  });

  const queryCounts: Record<string, { count: number; hasResults: boolean }> = {};
  for (const event of searchEvents) {
    const data = event.eventData as Record<string, unknown>;
    const query = (data?.query as string || '').toLowerCase().trim();
    if (!query) continue;
    if (!queryCounts[query]) queryCounts[query] = { count: 0, hasResults: true };
    queryCounts[query].count++;
    if (data?.resultCount === 0) queryCounts[query].hasResults = false;
  }

  const topQueries = Object.entries(queryCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([query, data]) => ({ query, ...data }));

  const zeroResultQueries = Object.entries(queryCounts)
    .filter(([, data]) => !data.hasResults)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([query, data]) => ({ query, count: data.count }));

  return NextResponse.json({ topQueries, zeroResultQueries, totalSearches: searchEvents.length, period: days });
}
