'use client';

import { useState, useEffect } from 'react';

interface Dispute {
  id: string;
  stripeDisputeId: string;
  amount: number;
  reason: string;
  status: string;
  evidence: string | null;
  createdAt: string;
  resolvedAt: string | null;
  order: { orderNumber: string; total: number };
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/api/admin/disputes')
      .then(r => r.json())
      .then(d => { setDisputes(d.disputes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/admin/disputes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status || undefined, evidence: evidence || undefined }),
    });
    if (res.ok) {
      const { dispute } = await res.json();
      setDisputes(prev => prev.map(d => d.id === id ? dispute : d));
      setEditId(null);
      setEvidence('');
      setStatus('');
    }
  };

  if (loading) return <div className="p-8">Loading disputes...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dispute Management</h1>
      {disputes.length === 0 ? (
        <p className="text-gray-500">No disputes found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map(d => (
              <tr key={d.id} className="border-b">
                <td className="p-3">{d.order.orderNumber}</td>
                <td className="p-3">${Number(d.amount).toFixed(2)}</td>
                <td className="p-3">{d.reason}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    d.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                    d.status === 'WON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>{d.status}</span>
                </td>
                <td className="p-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  {editId === d.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={evidence}
                        onChange={e => setEvidence(e.target.value)}
                        placeholder="Evidence..."
                        className="w-full border p-1 rounded text-sm"
                        rows={2}
                      />
                      <select value={status} onChange={e => setStatus(e.target.value)} className="border p-1 rounded text-sm">
                        <option value="">Keep status</option>
                        <option value="WON">Won</option>
                        <option value="LOST">Lost</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(d.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
                        <button onClick={() => setEditId(null)} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setEditId(d.id); setEvidence(d.evidence || ''); }} className="text-blue-600 text-sm hover:underline">
                      Respond
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
