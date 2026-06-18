import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const funnelSteps = ['visit', 'product_view', 'add_to_cart', 'checkout', 'purchase'];

  const counts = await Promise.all(
    funnelSteps.map(step =>
      prisma.analyticsEvent.count({
        where: { eventType: step, createdAt: { gte: startDate } },
      })
    )
  );

  const funnel = funnelSteps.map((step, i) => ({
    step,
    count: counts[i],
    conversionRate: i === 0 ? 100 : counts[0] > 0 ? Math.round((counts[i] / counts[0]) * 10000) / 100 : 0,
    dropoff: i === 0 ? 0 : counts[i - 1] > 0 ? Math.round(((counts[i - 1] - counts[i]) / counts[i - 1]) * 10000) / 100 : 0,
  }));

  return NextResponse.json({ funnel, period: days });
}
