'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Subscription {
  id: string;
  frequency: string;
  quantity: number;
  discountPercent: string;
  nextDelivery: string;
  status: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: string;
    images: { url: string; alt: string | null }[];
  };
}

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Every week',
  BIWEEKLY: 'Every 2 weeks',
  MONTHLY: 'Every month',
  BIMONTHLY: 'Every 2 months',
  QUARTERLY: 'Every 3 months',
};

const FREQUENCIES = ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY'];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    const res = await fetch('/api/subscriptions');
    if (res.ok) {
      setSubscriptions(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchSubscriptions();
  };

  const handleFrequencyChange = async (id: string, frequency: string) => {
    await fetch(`/api/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frequency }),
    });
    fetchSubscriptions();
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this subscription?')) return;
    await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
    fetchSubscriptions();
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Subscribe & Save</h1>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No subscriptions yet</p>
          <Link href="/products" className="text-amazon-blue hover:underline">
            Browse products to subscribe
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const price = Number(sub.product.price);
            const discount = Number(sub.discountPercent);
            const discountedPrice = price * (1 - discount / 100);
            const image = sub.product.images[0]?.url;
            const isActive = sub.status === 'ACTIVE';
            const isPaused = sub.status === 'PAUSED';

            return (
              <div key={sub.id} className="border rounded-lg p-4 flex gap-4">
                {image && (
                  <Link href={`/products/${sub.product.slug}`}>
                    <img src={image} alt={sub.product.title} className="w-20 h-20 object-contain" />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${sub.product.slug}`} className="font-medium hover:text-amazon-orange line-clamp-1">
                    {sub.product.title}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="text-red-600 font-medium">${discountedPrice.toFixed(2)}</span>
                    <span className="line-through ml-2 text-gray-400">${price.toFixed(2)}</span>
                    <span className="text-green-600 ml-1">({discount}% off)</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Qty: {sub.quantity} · Next delivery: {new Date(sub.nextDelivery).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={sub.frequency}
                      onChange={(e) => handleFrequencyChange(sub.id, e.target.value)}
                      disabled={!isActive && !isPaused}
                      className="text-xs border rounded px-2 py-1"
                    >
                      {FREQUENCIES.map((f) => (
                        <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
                      ))}
                    </select>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-green-100 text-green-700' :
                      isPaused ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {isActive && (
                      <>
                        <button onClick={() => handleAction(sub.id, 'skip')} className="text-xs text-amazon-blue hover:underline">
                          Skip next
                        </button>
                        <button onClick={() => handleAction(sub.id, 'pause')} className="text-xs text-amazon-blue hover:underline">
                          Pause
                        </button>
                      </>
                    )}
                    {isPaused && (
                      <button onClick={() => handleAction(sub.id, 'resume')} className="text-xs text-amazon-blue hover:underline">
                        Resume
                      </button>
                    )}
                    {(isActive || isPaused) && (
                      <button onClick={() => handleCancel(sub.id)} className="text-xs text-red-600 hover:underline">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
