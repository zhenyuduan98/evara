import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string; details?: unknown }> = {};

  // DB check
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'healthy', latency: Date.now() - start };
  } catch (e: unknown) {
    checks.database = { status: 'unhealthy', error: (e as Error).message };
  }

  // Redis check
  try {
    const start = Date.now();
    await redis.ping();
    checks.redis = { status: 'healthy', latency: Date.now() - start };
  } catch (e: unknown) {
    checks.redis = { status: 'unhealthy', error: (e as Error).message };
  }

  // Meilisearch check
  try {
    const start = Date.now();
    const msHost = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
    const res = await fetch(`${msHost}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    checks.meilisearch = { status: data.status === 'available' ? 'healthy' : 'degraded', latency: Date.now() - start };
  } catch (e: unknown) {
    checks.meilisearch = { status: 'unhealthy', error: (e as Error).message };
  }

  // Memory
  const mem = process.memoryUsage();
  checks.memory = {
    status: mem.heapUsed / mem.heapTotal < 0.9 ? 'healthy' : 'warning',
    details: {
      heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
      external: `${Math.round(mem.external / 1024 / 1024)}MB`,
    },
  };

  // Disk (basic)
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  checks.system = {
    status: 'healthy',
    details: {
      platform: os.platform(),
      cpus: os.cpus().length,
      totalMemory: `${Math.round(totalMem / 1024 / 1024)}MB`,
      freeMemory: `${Math.round(freeMem / 1024 / 1024)}MB`,
      uptime: `${Math.round(os.uptime() / 3600)}h`,
      loadAvg: os.loadavg(),
    },
  };

  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  }, { status: allHealthy ? 200 : 503 });
}
