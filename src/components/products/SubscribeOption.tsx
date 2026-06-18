'use client';

import { useState } from 'react';
import { SubscriptionFrequency } from '@prisma/client';

const FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  WEEKLY: 'Every week',
  BIWEEKLY: 'Every 2 weeks',
  MONTHLY: 'Every month',
  BIMONTHLY: 'Every 2 months',
  QUARTERLY: 'Every 3 months',
};

function getDiscount(existingCount: number): number {
  const total = existingCount + 1;
  if (total >= 5) return 15;
  if (total >= 3) return 10;
  return 5;
}

interface SubscribeOptionProps {
  productId: string;
  price: number;
  existingSubscriptionCount?: number;
}

export default function SubscribeOption({ productId, price, existingSubscriptionCount = 0 }: SubscribeOptionProps) {
  const [mode, setMode] = useState<'onetime' | 'subscribe'>('onetime');
  const [frequency, setFrequency] = useState<SubscriptionFrequency>('MONTHLY');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const discount = getDiscount(existingSubscriptionCount);
  const discountedPrice = price * (1 - discount / 100);

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, frequency, quantity: 1 }),
      });
      if (res.ok) {
        setMessage('Subscribed successfully!');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch {
      setMessage('Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mt-4 bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold text-sm mb-3">Subscribe & Save</h3>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="purchaseMode"
            checked={mode === 'onetime'}
            onChange={() => setMode('onetime')}
            className="text-amazon-orange"
          />
          <span className="text-sm">One-time purchase: <strong>${price.toFixed(2)}</strong></span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="purchaseMode"
            checked={mode === 'subscribe'}
            onChange={() => setMode('subscribe')}
            className="text-amazon-orange"
          />
          <span className="text-sm">
            Subscribe & Save: <strong className="text-red-600">${discountedPrice.toFixed(2)}</strong>
            <span className="ml-1 text-green-600 text-xs font-medium">({discount}% off)</span>
          </span>
        </label>
      </div>

      {mode === 'subscribe' && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Delivery frequency:</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as SubscriptionFrequency)}
              className="mt-1 block w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-amazon-yellow hover:bg-yellow-500 text-sm font-medium py-2 px-4 rounded-full disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>

          {message && (
            <p className={`text-xs ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
