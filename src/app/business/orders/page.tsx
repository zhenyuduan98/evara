'use client';

import { useState, useEffect, useCallback } from 'react';

interface PurchaseOrder {
  id: string;
  requestedBy: string;
  items: unknown;
  status: string;
  approvedBy: string | null;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
}

export default function BusinessOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/business/purchase-orders');
      if (res.ok) {
        setOrders(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/business/purchase-orders/${id}/${action}`, {
      method: 'PATCH',
    });
    if (res.ok) fetchOrders();
  };

  const statusColor: Record<string, string> = {
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    ORDERED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Purchase Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No purchase orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-3 text-left">PO ID</th>
                <th className="border p-3 text-left">Requested By</th>
                <th className="border p-3 text-left">Amount</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="border p-3 font-mono text-sm">{po.id.slice(0, 8)}...</td>
                  <td className="border p-3">{po.requestedBy}</td>
                  <td className="border p-3">${Number(po.totalAmount).toFixed(2)}</td>
                  <td className="border p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[po.status] || ''}`}>
                      {po.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="border p-3 text-sm">{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td className="border p-3">
                    {po.status === 'PENDING_APPROVAL' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(po.id, 'approve')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(po.id, 'reject')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {po.approvedBy && (
                      <span className="text-sm text-gray-500">by {po.approvedBy}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
