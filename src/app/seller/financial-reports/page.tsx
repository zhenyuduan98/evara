'use client';

import { useState, useEffect } from 'react';

interface MonthlyData {
  month: number;
  monthName: string;
  revenue: number;
  commission: number;
  net: number;
  transactionCount: number;
}

interface ReportData {
  year: number;
  monthly: MonthlyData[];
  totals: { revenue: number; commission: number; net: number; transactions: number };
}

export default function SellerFinancialReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/seller/financial-reports?year=${year}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border rounded px-3 py-2"
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${data.totals.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Total Commission</p>
              <p className="text-2xl font-bold text-red-600">-${data.totals.commission.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Net Earnings</p>
              <p className="text-2xl font-bold text-blue-600">${data.totals.net.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Breakdown</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Month</th>
                  <th className="text-right py-2">Revenue</th>
                  <th className="text-right py-2">Commission</th>
                  <th className="text-right py-2">Net</th>
                  <th className="text-right py-2">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {data.monthly.map(m => (
                  <tr key={m.month} className="border-b">
                    <td className="py-3">{m.monthName}</td>
                    <td className="py-3 text-right">${m.revenue.toFixed(2)}</td>
                    <td className="py-3 text-right text-red-600">-${m.commission.toFixed(2)}</td>
                    <td className="py-3 text-right font-semibold">${m.net.toFixed(2)}</td>
                    <td className="py-3 text-right">{m.transactionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-gray-500">Failed to load report data.</p>
      )}
    </div>
  );
}
