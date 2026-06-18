'use client';

import { useEffect, useState } from 'react';

interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  items: unknown;
  reason: string;
  status: string;
  returnLabel: string | null;
  adminNote: string | null;
  createdAt: string;
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = () => {
    fetch('/api/admin/returns')
      .then((r) => r.json())
      .then((d) => setReturns(d.returns || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReturns(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/returns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchReturns();
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    RECEIVED: 'bg-blue-100 text-blue-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
  };

  const reasonLabels: Record<string, string> = {
    DEFECTIVE: 'Defective',
    WRONG_ITEM: 'Wrong Item',
    CHANGED_MIND: 'Changed Mind',
    NOT_AS_DESCRIBED: 'Not as Described',
    OTHER: 'Other',
  };

  if (loading) return <div className="p-6">Loading returns...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Return Requests</h1>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Reason</th>
              <th className="text-left p-3">Date</th>
              <th className="text-center p-3">Status</th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-mono text-xs">{r.id.slice(0, 8)}...</td>
                <td className="p-3 font-mono text-xs">{r.orderId.slice(0, 8)}...</td>
                <td className="p-3">{reasonLabels[r.reason] || r.reason}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[r.status] || ''}`}>{r.status}</span>
                </td>
                <td className="p-3 text-center space-x-1">
                  {r.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(r.id, 'APPROVED')} className="text-green-600 hover:underline text-xs">Approve</button>
                      <button onClick={() => updateStatus(r.id, 'REJECTED')} className="text-red-600 hover:underline text-xs">Reject</button>
                    </>
                  )}
                  {r.status === 'APPROVED' && (
                    <button onClick={() => updateStatus(r.id, 'RECEIVED')} className="text-blue-600 hover:underline text-xs">Mark Received</button>
                  )}
                  {r.status === 'RECEIVED' && (
                    <button onClick={() => updateStatus(r.id, 'REFUNDED')} className="text-purple-600 hover:underline text-xs">Refund</button>
                  )}
                </td>
              </tr>
            ))}
            {returns.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">No return requests.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
