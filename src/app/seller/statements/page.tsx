'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  orderId: string;
  orderItemId: string;
  amount: string;
  commission: string;
  net: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SellerStatementsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchStatements(1);
  }, [statusFilter]);

  async function fetchStatements(page: number) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/seller/statements?${params}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch {}
    setLoading(false);
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    AVAILABLE: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Transaction Statements</h1>

      <div className="flex gap-4 mb-4">
        {['', 'PENDING', 'AVAILABLE', 'PAID'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="p-6 text-gray-500">No transactions found.</p>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-right py-3 px-4">Commission</th>
                  <th className="text-right py-3 px-4">Net</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-mono text-sm">{t.orderId.slice(0, 8)}...</td>
                    <td className="py-3 px-4 text-right">${Number(t.amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-red-600">-${Number(t.commission).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-semibold">${Number(t.net).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${statusColors[t.status] || 'bg-gray-100'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchStatements(pagination.page - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchStatements(pagination.page + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
