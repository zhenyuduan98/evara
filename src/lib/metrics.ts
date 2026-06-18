// In-memory metrics collection for performance monitoring

interface RequestRecord {
  path: string;
  duration: number;
  statusCode: number;
  timestamp: number;
}

class MetricsCollector {
  private requests: RequestRecord[] = [];
  private totalRequests = 0;
  private errorCount = 0;
  private totalDuration = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private readonly maxRecords = 1000;

  trackRequest(path: string, duration: number, statusCode: number) {
    this.totalRequests++;
    this.totalDuration += duration;
    if (statusCode >= 400) this.errorCount++;

    this.requests.push({ path, duration, statusCode, timestamp: Date.now() });
    if (this.requests.length > this.maxRecords) {
      this.requests = this.requests.slice(-this.maxRecords);
    }
  }

  trackCacheHit() { this.cacheHits++; }
  trackCacheMiss() { this.cacheMisses++; }

  getMetrics() {
    const durations = this.requests.map(r => r.duration).sort((a, b) => a - b);
    const percentile = (p: number) => {
      if (durations.length === 0) return 0;
      const idx = Math.ceil((p / 100) * durations.length) - 1;
      return durations[Math.max(0, idx)];
    };

    const avgResponseTime = this.totalRequests > 0
      ? Math.round(this.totalDuration / this.totalRequests)
      : 0;

    const errorRate = this.totalRequests > 0
      ? Number(((this.errorCount / this.totalRequests) * 100).toFixed(2))
      : 0;

    // Per-path stats
    const pathStats: Record<string, { count: number; avgDuration: number; errors: number }> = {};
    for (const r of this.requests) {
      const key = r.path.replace(/\/[a-zA-Z0-9_-]{20,}/, '/:id');
      if (!pathStats[key]) pathStats[key] = { count: 0, avgDuration: 0, errors: 0 };
      pathStats[key].count++;
      pathStats[key].avgDuration += r.duration;
      if (r.statusCode >= 400) pathStats[key].errors++;
    }
    for (const key of Object.keys(pathStats)) {
      pathStats[key].avgDuration = Math.round(pathStats[key].avgDuration / pathStats[key].count);
    }

    return {
      totalRequests: this.totalRequests,
      errorCount: this.errorCount,
      errorRate,
      avgResponseTime,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
      recentRequests: this.requests.length,
      uptime: process.uptime(),
      pathStats,
    };
  }

  getCacheStats() {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      total,
      hitRate: total > 0 ? Number(((this.cacheHits / total) * 100).toFixed(2)) : 0,
    };
  }
}

const globalForMetrics = globalThis as unknown as { metricsCollector: MetricsCollector };
export const metrics = globalForMetrics.metricsCollector || new MetricsCollector();
if (process.env.NODE_ENV !== 'production') globalForMetrics.metricsCollector = metrics;

export function trackRequest(path: string, duration: number, statusCode: number) {
  metrics.trackRequest(path, duration, statusCode);
}

export function getMetrics() {
  return metrics.getMetrics();
}

export function getCacheStats() {
  return metrics.getCacheStats();
}
