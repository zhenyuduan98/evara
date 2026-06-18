'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  orderId: string;
  orderItemId: string;
  amount: number;
  commission: number;
  commissionRate: number;
  net: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface EarningsData {
  totalEarnings: number;
  totalCommission: number;
  pendingBalance: number;
  availableBalance: number;
  paidTotal: number;
  commissionRate: number;
  transactions: Transaction[];
}

export default function SellerEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchEarnings = (fromDate?: string, toDate?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    fetch(`/api/seller/earnings?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEarnings(); }, []);

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    AVAILABLE: 'bg-green-100 text-green-800',
    PAID: 'bg-blue-100 text-blue-800',
  };

  if (loading) return <div className="p-6">Loading earnings...</div>;
  if (!data) return <div className="p-6">Failed to load earnings. <Link href="/seller/dashboard" className="text-blue-600 underline">Back to dashboard</Link></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Earnings & Payouts</h1>
        <Link href="/seller/dashboard" className="text-blue-600 hover:underline">← Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Earnings', value: fmt(data.totalEarnings), color: 'bg-green-50 border-green-200' },
          { label: 'Pending', value: fmt(data.pendingBalance), color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Available', value: fmt(data.availableBalance), color: 'bg-blue-50 border-blue-200' },
          { label: 'Paid Out', value: fmt(data.paidTotal), color: 'bg-gray-50 border-gray-200' },
        ].map((card) => (
          <div key={card.label} className={`p-4 rounded-lg border ${card.color}`}>
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-500 mb-2">Commission Rate: <strong>{(data.commissionRate * 100).toFixed(0)}%</strong> · Total Commission Paid: <strong>{fmt(data.totalCommission)}</strong></p>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-3 py-1" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-3 py-1" />
          </div>
          <button onClick={() => fetchEarnings(from, to)} className="bg-amber-500 text-white px-4 py-1 rounded hover:bg-amber-600">Filter</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">Transaction History</h2>
        {data.transactions.length === 0 ? (
          <p className="p-4 text-gray-500">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Order</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-right p-3">Commission</th>
                <th className="text-right p-3">Net</th>
                <th className="text-center p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-mono text-xs">{t.orderId.slice(0, 8)}...</td>
                  <td className="p-3 text-right">{fmt(Number(t.amount))}</td>
                  <td className="p-3 text-right text-red-600">-{fmt(Number(t.commission))}</td>
                  <td className="p-3 text-right font-semibold">{fmt(Number(t.net))}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[t.status] || ''}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
