'use client';

import { useState, useEffect } from 'react';

interface RefundWithOrder {
  id: string;
  reason: string;
  status: string;
  amount: number;
  type: string;
  adminNote: string | null;
  createdAt: string;
  order: { id: string; orderNumber: string; total: number };
  user: { name: string | null; email: string | null };
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetch('/api/admin/refunds').then(r => r.json()).then(data => {
      setRefunds(data.refunds || []);
      setLoading(false);
    });
  }, []);

  const handleAction = async (refundId: string, status: string, adminNote?: string) => {
    setActionLoading(refundId);
    try {
      const res = await fetch(`/api/admin/refunds/${refundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote }),
      });
      if (res.ok) {
        const data = await res.json();
        setRefunds(prev => prev.map(r => r.id === refundId ? { ...r, ...data.refund } : r));
      }
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Refund Management</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map(refund => (
              <tr key={refund.id} className="border-b">
                <td className="p-3 text-sm">#{refund.order.orderNumber.slice(-8)}</td>
                <td className="p-3 text-sm">{refund.user.name || refund.user.email}</td>
                <td className="p-3 text-sm">{refund.type}</td>
                <td className="p-3 text-sm">${Number(refund.amount).toFixed(2)}</td>
                <td className="p-3 text-sm max-w-xs truncate">{refund.reason}</td>
                <td className="p-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    refund.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    refund.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    refund.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>{refund.status}</span>
                </td>
                <td className="p-3">
                  {refund.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(refund.id, 'APPROVED')}
                        disabled={actionLoading === refund.id}
                        className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                        Approve
                      </button>
                      <button onClick={() => handleAction(refund.id, 'REJECTED', 'Refund denied by admin')}
                        disabled={actionLoading === refund.id}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Reject
                      </button>
                    </div>
                  )}
                  {refund.status === 'APPROVED' && (
                    <button onClick={() => handleAction(refund.id, 'COMPLETED')}
                      disabled={actionLoading === refund.id}
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                      Mark Completed
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {refunds.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500">No refund requests</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
