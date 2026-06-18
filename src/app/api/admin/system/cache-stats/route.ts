import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getCacheStats } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appCacheStats = getCacheStats();

  let redisInfo: Record<string, string | number> = {};
  try {
    const info = await redis.info('stats');
    const lines = info.split('\r\n');
    for (const line of lines) {
      if (line.includes('keyspace_hits')) redisInfo.keyspaceHits = parseInt(line.split(':')[1]);
      if (line.includes('keyspace_misses')) redisInfo.keyspaceMisses = parseInt(line.split(':')[1]);
    }
    const memInfo = await redis.info('memory');
    for (const line of memInfo.split('\r\n')) {
      if (line.startsWith('used_memory_human')) redisInfo.usedMemory = line.split(':')[1];
    }
    const dbSize = await redis.dbsize();
    redisInfo.totalKeys = dbSize;
  } catch {
    redisInfo = { error: 'Could not connect to Redis' } as Record<string, string | number>;
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    application: appCacheStats,
    redis: redisInfo,
  });
}
