'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
}

const REASONS = [
  { value: 'DEFECTIVE', label: 'Defective product' },
  { value: 'WRONG_ITEM', label: 'Wrong item received' },
  { value: 'CHANGED_MIND', label: 'Changed my mind' },
  { value: 'NOT_AS_DESCRIBED', label: 'Not as described' },
  { value: 'OTHER', label: 'Other' },
];

export default function ReturnPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) { setError('Select at least one item'); return; }
    if (!reason) { setError('Select a reason'); return; }
    setSubmitting(true);
    setError('');

    const res = await fetch(`/api/orders/${orderId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: selectedItems, reason, description }),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to submit return');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-6">Loading order...</div>;
  if (!order) return <div className="p-6">Order not found. <Link href="/account/orders" className="text-blue-600 underline">Back to orders</Link></div>;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-xl font-bold text-green-800 mb-2">Return Request Submitted</h2>
          <p className="text-gray-600 mb-4">We&apos;ll review your request and get back to you shortly.</p>
          <Link href="/account/orders" className="text-blue-600 hover:underline">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href={`/account/orders/${orderId}`} className="text-blue-600 hover:underline text-sm">← Back to Order</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Request a Return</h1>
      <p className="text-sm text-gray-500 mb-4">Order #{order.orderNumber}</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Select items to return</h2>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <label key={item.id} className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${selectedItems.includes(item.id) ? 'border-blue-500 bg-blue-50' : ''}`}>
                <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleItem(item.id)} className="w-4 h-4" />
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} · ${Number(item.price).toFixed(2)}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">Reason for return</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border rounded px-3 py-2" required>
            <option value="">Select a reason</option>
            {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">Additional details (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border rounded px-3 py-2" placeholder="Describe the issue..." />
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-amber-500 text-white py-3 rounded font-semibold hover:bg-amber-600 disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Return Request'}
        </button>
      </form>
    </div>
  );
}
