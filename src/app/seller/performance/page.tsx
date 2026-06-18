'use client';

import { useState, useEffect } from 'react';

interface PerformanceData {
  current: {
    orderDefectRate: number;
    lateShipRate: number;
    cancellationRate: number;
    responseTime: number;
    score: number;
    period: string;
  };
  history: Array<{
    period: string;
    score: number;
    orderDefectRate: number;
    lateShipRate: number;
    cancellationRate: number;
    responseTime: number;
  }>;
}

function MetricCard({ label, value, target, unit, status }: { label: string; value: number; target: number; unit: string; status: string }) {
  const color = status === 'good' ? 'text-green-600 bg-green-50 border-green-200' : status === 'warning' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-red-600 bg-red-50 border-red-200';
  return (
    <div className={`border rounded-lg p-4 ${color}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}{unit}</p>
      <p className="text-xs mt-1">Target: &lt; {target}{unit}</p>
    </div>
  );
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/performance')
      .then(r => r.json())
      .then(res => { if (res.data) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><p>Loading performance data...</p></div>;
  if (!data) return <div className="p-8"><p>Failed to load performance data.</p></div>;

  const { current } = data;
  const getStatus = (val: number, threshold: number) => val <= threshold * 0.5 ? 'good' : val <= threshold ? 'warning' : 'bad';

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Seller Performance Dashboard</h1>
      <p className="text-gray-500 mb-6">Period: {current.period}</p>

      <div className="mb-8">
        <div className="bg-white border rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">Overall Health Score</p>
          <p className={`text-5xl font-bold mt-2 ${current.score >= 80 ? 'text-green-600' : current.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {current.score}
          </p>
          <p className="text-gray-400 mt-1">out of 100</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className={`h-3 rounded-full ${current.score >= 80 ? 'bg-green-500' : current.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${current.score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Order Defect Rate" value={Math.round(current.orderDefectRate * 10000) / 100} target={1} unit="%" status={getStatus(current.orderDefectRate, 0.01)} />
        <MetricCard label="Late Shipment Rate" value={Math.round(current.lateShipRate * 10000) / 100} target={4} unit="%" status={getStatus(current.lateShipRate, 0.04)} />
        <MetricCard label="Cancellation Rate" value={Math.round(current.cancellationRate * 10000) / 100} target={2.5} unit="%" status={getStatus(current.cancellationRate, 0.025)} />
        <MetricCard label="Response Time" value={current.responseTime} target={24} unit="h" status={getStatus(current.responseTime, 24)} />
      </div>

      {data.history.length > 1 && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Score History</h2>
          <div className="flex items-end space-x-2 h-40">
            {data.history.slice().reverse().map((h, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full rounded-t ${h.score >= 80 ? 'bg-green-400' : h.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ height: `${h.score}%` }}
                />
                <span className="text-xs mt-1 text-gray-500">{h.period.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
