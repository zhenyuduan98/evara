'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });
const BarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });
const FunnelChart = dynamic(() => import('@/components/charts/FunnelChart'), { ssr: false });
const CohortHeatmap = dynamic(() => import('@/components/charts/CohortHeatmap'), { ssr: false });

interface FunnelStep {
  step: string;
  count: number;
  conversionRate: number;
  dropoff: number;
}

interface SearchQuery {
  query: string;
  count: number;
  hasResults?: boolean;
}

interface AnalyticsData {
  revenueOverTime: { date: string; revenue: number }[];
  ordersByStatus: { name: string; value: number }[];
  topProducts: { name: string; sales: number }[];
}

const stepLabels: Record<string, string> = {
  visit: 'Visit',
  product_view: 'Product View',
  add_to_cart: 'Add to Cart',
  checkout: 'Checkout',
  purchase: 'Purchase',
};

export default function AnalyticsDashboard() {
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [topQueries, setTopQueries] = useState<SearchQuery[]>([]);
  const [zeroResultQueries, setZeroResultQueries] = useState<SearchQuery[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({ revenueOverTime: [], ordersByStatus: [], topProducts: [] });
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch(`/api/admin/analytics/funnel?days=${days}`).then(r => r.json()).then(d => setFunnel(d.funnel || []));
    fetch(`/api/admin/analytics/search?days=${days}`).then(r => r.json()).then(d => {
      setTopQueries(d.topQueries || []);
      setZeroResultQueries(d.zeroResultQueries || []);
    });
    fetch(`/api/admin/analytics?days=${days}`).then(r => r.json()).then(d => {
      setAnalytics({
        revenueOverTime: d.revenueOverTime || [],
        ordersByStatus: d.ordersByStatus || [],
        topProducts: d.topProducts || [],
      });
    });
  }, [days]);

  const funnelData = funnel.map(f => ({ name: stepLabels[f.step] || f.step, value: f.count }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <div className="flex gap-3">
            <a
              href={`/api/admin/analytics/export?days=${days}`}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              📥 Export CSV
            </a>
            <select value={days} onChange={e => setDays(Number(e.target.value))} className="border rounded px-3 py-2">
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Revenue Over Time */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
          {analytics.revenueOverTime.length > 0 ? (
            <LineChart data={analytics.revenueOverTime} xKey="date" lines={[{ key: 'revenue', name: 'Revenue ($)', color: '#3b82f6' }]} />
          ) : (
            <p className="text-gray-500 text-center py-8">No revenue data yet.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Orders by Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>
            {analytics.ordersByStatus.length > 0 ? (
              <PieChart data={analytics.ordersByStatus} />
            ) : (
              <p className="text-gray-500 text-center py-8">No order data yet.</p>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Products</h2>
            {analytics.topProducts.length > 0 ? (
              <BarChart data={analytics.topProducts} xKey="name" bars={[{ key: 'sales', name: 'Sales', color: '#10b981' }]} />
            ) : (
              <p className="text-gray-500 text-center py-8">No product data yet.</p>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
          {funnelData.length > 0 ? (
            <FunnelChart data={funnelData} height={250} />
          ) : (
            <p className="text-gray-500 text-center py-8">No funnel data yet. Track events to see the funnel.</p>
          )}
        </div>

        {/* Cohort Retention Heatmap */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📅 Cohort Retention</h2>
          <CohortHeatmap />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Search Queries */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Search Queries</h2>
            {topQueries.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">Query</th><th className="text-right py-2">Count</th></tr></thead>
                <tbody>
                  {topQueries.map(q => (
                    <tr key={q.query} className="border-b"><td className="py-2">{q.query}</td><td className="text-right">{q.count}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-gray-500 text-center py-8">No search data yet.</p>}
          </div>

          {/* Zero Result Queries */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Zero Result Queries</h2>
            {zeroResultQueries.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">Query</th><th className="text-right py-2">Count</th></tr></thead>
                <tbody>
                  {zeroResultQueries.map(q => (
                    <tr key={q.query} className="border-b text-red-600"><td className="py-2">{q.query}</td><td className="text-right">{q.count}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-gray-500 text-center py-8">No zero-result queries.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
