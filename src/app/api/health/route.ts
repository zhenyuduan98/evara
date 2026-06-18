import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { meili } from '@/lib/meilisearch';

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // DB check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'healthy', latencyMs: Date.now() - dbStart };
  } catch (e) {
    checks.database = { status: 'unhealthy', error: String(e), latencyMs: Date.now() - dbStart };
  }

  // Redis check
  const redisStart = Date.now();
  try {
    await redis.ping();
    checks.redis = { status: 'healthy', latencyMs: Date.now() - redisStart };
  } catch (e) {
    checks.redis = { status: 'unhealthy', error: String(e), latencyMs: Date.now() - redisStart };
  }

  // Meilisearch check
  const meiliStart = Date.now();
  try {
    await meili.health();
    checks.meilisearch = { status: 'healthy', latencyMs: Date.now() - meiliStart };
  } catch (e) {
    checks.meilisearch = { status: 'unhealthy', error: String(e), latencyMs: Date.now() - meiliStart };
  }

  const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');

  return NextResponse.json(
    { status: allHealthy ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allHealthy ? 200 : 503 }
  );
}
