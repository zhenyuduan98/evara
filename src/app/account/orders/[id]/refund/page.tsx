'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RefundPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<{ id: string; orderNumber: string; total: number; status: string; items: { title: string; price: number; quantity: number }[]; refunds?: { id: string; status: string; amount: number; reason: string; type: string; createdAt: string }[] } | null>(null);
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`).then(r => r.json()).then(data => {
      setOrder(data.order || data);
      setAmount(String(Number(data.order?.total || data.total || 0)));
    });
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, type, amount: parseFloat(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div className="p-6">Loading...</div>;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Refund Request Submitted</h2>
          <p className="text-gray-600 mb-4">Your refund request has been submitted and is pending review.</p>
          <button onClick={() => router.push('/account/orders')} className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-semibold">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Request Refund</h1>
      <p className="text-gray-600 mb-6">Order #{order.orderNumber}</p>

      {/* Existing refunds */}
      {order.refunds && order.refunds.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Previous Refund Requests</h3>
          {order.refunds.map(r => (
            <div key={r.id} className="flex justify-between text-sm py-1">
              <span>{r.type} refund — ${Number(r.amount).toFixed(2)}</span>
              <span className={`font-semibold ${r.status === 'APPROVED' || r.status === 'COMPLETED' ? 'text-green-600' : r.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Refund Type</label>
          <select value={type} onChange={e => { setType(e.target.value as 'FULL' | 'PARTIAL'); if (e.target.value === 'FULL') setAmount(String(Number(order.total))); }}
            className="w-full p-2 border rounded">
            <option value="FULL">Full Refund</option>
            <option value="PARTIAL">Partial Refund</option>
          </select>
        </div>

        {type === 'PARTIAL' && (
          <div>
            <label className="block font-semibold mb-1">Amount ($)</label>
            <input type="number" step="0.01" min="0.01" max={Number(order.total)} value={amount}
              onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
        )}

        <div>
          <label className="block font-semibold mb-1">Reason for Refund</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            className="w-full p-2 border rounded" rows={4} required
            placeholder="Please describe why you'd like a refund..." />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading || !reason}
            className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Refund Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
