import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  const metrics = getMetrics();
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ...metrics,
  });
}
