'use client';

import { useState, useEffect } from 'react';

interface CSATData {
  summary: {
    avgScore: number;
    totalFeedbacks: number;
    distribution: Record<number, number>;
    satisfactionRate: number;
  };
  agentPerformance: { agentId: string; avgScore: number; totalRatings: number }[];
  dailyTrend: { date: string; avgScore: number; count: number }[];
  categoryBreakdown: { category: string; avgScore: number; count: number }[];
}

export default function CSATDashboard() {
  const [data, setData] = useState<CSATData | null>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/csat?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="p-8">Loading CSAT data...</div>;
  if (!data) return <div className="p-8">Failed to load data</div>;

  const { summary, agentPerformance, dailyTrend, categoryBreakdown } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Customer Satisfaction Dashboard</h1>

      <div className="mb-4">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Average Score</div>
          <div className="text-3xl font-bold text-blue-600">{summary.avgScore.toFixed(1)}/5</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Total Ratings</div>
          <div className="text-3xl font-bold">{summary.totalFeedbacks}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Satisfaction Rate</div>
          <div className="text-3xl font-bold text-green-600">{summary.satisfactionRate}%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Score Distribution</div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex-1 text-center">
                <div className="text-xs text-gray-400">{s}★</div>
                <div className="text-sm font-semibold">{summary.distribution[s] || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Daily Trend</h2>
        {dailyTrend.length === 0 ? (
          <p className="text-gray-500">No trend data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Avg Score</th>
                  <th className="text-left py-2">Responses</th>
                  <th className="text-left py-2">Visual</th>
                </tr>
              </thead>
              <tbody>
                {dailyTrend.map((d) => (
                  <tr key={d.date} className="border-b">
                    <td className="py-2">{d.date}</td>
                    <td className="py-2">{d.avgScore.toFixed(1)}</td>
                    <td className="py-2">{d.count}</td>
                    <td className="py-2">
                      <div
                        className="bg-blue-500 h-4 rounded"
                        style={{ width: `${(d.avgScore / 5) * 100}%` }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agent Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Agent Performance</h2>
          {agentPerformance.length === 0 ? (
            <p className="text-gray-500">No agent data</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Agent</th>
                  <th className="text-left py-2">Avg Score</th>
                  <th className="text-left py-2">Ratings</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((a) => (
                  <tr key={a.agentId} className="border-b">
                    <td className="py-2 font-mono text-xs">{a.agentId.slice(0, 8)}...</td>
                    <td className="py-2">{a.avgScore.toFixed(1)}</td>
                    <td className="py-2">{a.totalRatings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="text-gray-500">No category data</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Avg Score</th>
                  <th className="text-left py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((c) => (
                  <tr key={c.category} className="border-b">
                    <td className="py-2">{c.category}</td>
                    <td className="py-2">{c.avgScore.toFixed(1)}</td>
                    <td className="py-2">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
