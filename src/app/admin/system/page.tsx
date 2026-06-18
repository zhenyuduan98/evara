'use client';

import { useState, useEffect, useCallback } from 'react';

interface HealthCheck {
  status: string;
  latency?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface HealthData {
  status: string;
  timestamp: string;
  checks: Record<string, HealthCheck>;
}

interface MetricsData {
  totalRequests: number;
  errorCount: number;
  errorRate: number;
  avgResponseTime: number;
  p50: number;
  p95: number;
  p99: number;
  uptime: number;
  pathStats: Record<string, { count: number; avgDuration: number; errors: number }>;
}

interface CacheData {
  application: { hits: number; misses: number; total: number; hitRate: number };
  redis: Record<string, string | number>;
}

export default function SystemPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [cache, setCache] = useState<CacheData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [h, m, c] = await Promise.all([
        fetch('/api/admin/system/health').then(r => r.json()),
        fetch('/api/admin/system/metrics').then(r => r.json()),
        fetch('/api/admin/system/cache-stats').then(r => r.json()),
      ]);
      setHealth(h);
      setMetrics(m);
      setCache(c);
    } catch (e) {
      console.error('Failed to fetch system data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return <div className="p-8"><div className="animate-pulse text-lg">Loading system status...</div></div>;
  }

  const StatusDot = ({ status }: { status: string }) => (
    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
      status === 'healthy' ? 'bg-green-500' : status === 'warning' || status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
    }`} />
  );

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">System Monitor</h1>
        <button onClick={fetchAll} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Refresh
        </button>
      </div>

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {health && Object.entries(health.checks).map(([name, check]) => (
          <Card key={name} title={name.charAt(0).toUpperCase() + name.slice(1)}>
            <div className="flex items-center mb-2">
              <StatusDot status={check.status} />
              <span className="capitalize font-medium">{check.status}</span>
            </div>
            {check.latency !== undefined && <p className="text-sm text-gray-500">Latency: {check.latency}ms</p>}
            {check.error && <p className="text-sm text-red-500">{check.error}</p>}
            {check.details && (
              <div className="text-xs text-gray-400 mt-2 space-y-1">
                {Object.entries(check.details).map(([k, v]) => (
                  <div key={k}><span className="font-medium">{k}:</span> {Array.isArray(v) ? v.map(n => typeof n === 'number' ? n.toFixed(2) : n).join(', ') : String(v)}</div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Request Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card title="Request Metrics">
            <div className="space-y-2">
              <div className="flex justify-between"><span>Total Requests</span><span className="font-bold">{metrics.totalRequests.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Error Count</span><span className="font-bold text-red-500">{metrics.errorCount}</span></div>
              <div className="flex justify-between"><span>Error Rate</span><span className="font-bold">{metrics.errorRate}%</span></div>
            </div>
          </Card>
          <Card title="Response Times">
            <div className="space-y-2">
              <div className="flex justify-between"><span>Average</span><span className="font-bold">{metrics.avgResponseTime}ms</span></div>
              <div className="flex justify-between"><span>P50</span><span className="font-bold">{metrics.p50}ms</span></div>
              <div className="flex justify-between"><span>P95</span><span className="font-bold">{metrics.p95}ms</span></div>
              <div className="flex justify-between"><span>P99</span><span className="font-bold">{metrics.p99}ms</span></div>
            </div>
          </Card>
          <Card title="Server Info">
            <div className="space-y-2">
              <div className="flex justify-between"><span>Uptime</span><span className="font-bold">{Math.round(metrics.uptime / 60)}m</span></div>
              <div className="flex justify-between"><span>Tracked Paths</span><span className="font-bold">{Object.keys(metrics.pathStats).length}</span></div>
            </div>
          </Card>
        </div>
      )}

      {/* Cache Stats */}
      {cache && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card title="Application Cache">
            <div className="space-y-2">
              <div className="flex justify-between"><span>Hits</span><span className="font-bold text-green-600">{cache.application.hits}</span></div>
              <div className="flex justify-between"><span>Misses</span><span className="font-bold text-red-500">{cache.application.misses}</span></div>
              <div className="flex justify-between"><span>Hit Rate</span><span className="font-bold">{cache.application.hitRate}%</span></div>
            </div>
          </Card>
          <Card title="Redis Stats">
            <div className="space-y-2">
              {Object.entries(cache.redis).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-bold">{String(v)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Top Paths */}
      {metrics && Object.keys(metrics.pathStats).length > 0 && (
        <Card title="Top API Paths">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="text-left py-2">Path</th>
                <th className="text-right py-2">Requests</th>
                <th className="text-right py-2">Avg Duration</th>
                <th className="text-right py-2">Errors</th>
              </tr></thead>
              <tbody>
                {Object.entries(metrics.pathStats)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 20)
                  .map(([path, stats]) => (
                    <tr key={path} className="border-b border-gray-100">
                      <td className="py-2 font-mono text-xs">{path}</td>
                      <td className="text-right py-2">{stats.count}</td>
                      <td className="text-right py-2">{stats.avgDuration}ms</td>
                      <td className="text-right py-2 text-red-500">{stats.errors}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
