'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface MembershipData {
  tier: string;
  expiresAt: string | null;
  benefits: Record<string, boolean> | null;
}

const tierBenefits: Record<string, { label: string; benefits: string[] }> = {
  FREE: {
    label: 'Free',
    benefits: ['Standard shipping', 'Basic product access', 'Customer reviews'],
  },
  PRIME: {
    label: 'Prime',
    benefits: ['FREE two-day shipping', 'Prime Video access', 'Prime Music', 'Prime Reading', 'Exclusive deals', 'Photo storage'],
  },
  PRIME_PLUS: {
    label: 'Prime+',
    benefits: ['Everything in Prime', 'FREE same-day delivery', 'Grocery delivery', 'Prime Wardrobe', '10% back at Whole Foods', 'Early access to Lightning Deals'],
  },
};

const tierPrices: Record<string, string> = {
  PRIME: '$14.99/month',
  PRIME_PLUS: '$24.99/month',
};

export default function MembershipPage() {
  const { data: session } = useSession();
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/membership')
      .then((r) => r.json())
      .then((d) => setMembership(d.membership || { tier: 'FREE', expiresAt: null, benefits: null }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const subscribe = async (tier: string) => {
    setSubscribing(tier);
    setMessage('');
    try {
      const res = await fetch('/api/membership/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembership(data.membership);
        setMessage(`Successfully subscribed to ${tierBenefits[tier]?.label}!`);
      }
    } catch {
      // ignore
    } finally {
      setSubscribing('');
    }
  };

  if (loading) return <div>Loading...</div>;

  const currentTier = membership?.tier || 'FREE';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Membership</h2>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">{message}</div>}

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-600">Current Plan</p>
        <p className="text-xl font-bold text-blue-700">{tierBenefits[currentTier]?.label}</p>
        {membership?.expiresAt && (
          <p className="text-sm text-gray-500">Renews: {new Date(membership.expiresAt).toLocaleDateString()}</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(tierBenefits).map(([key, info]) => (
          <div
            key={key}
            className={`border rounded-lg p-4 ${currentTier === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
          >
            <h3 className="font-bold text-lg">{info.label}</h3>
            {tierPrices[key] && <p className="text-sm text-gray-600 mb-2">{tierPrices[key]}</p>}
            {key === 'FREE' && <p className="text-sm text-gray-600 mb-2">Free forever</p>}
            <ul className="text-sm space-y-1 mb-4">
              {info.benefits.map((b) => (
                <li key={b} className="flex items-start gap-1">
                  <span className="text-green-500">✓</span> {b}
                </li>
              ))}
            </ul>
            {currentTier === key ? (
              <span className="text-sm font-medium text-blue-600">Current Plan</span>
            ) : (
              <button
                onClick={() => subscribe(key)}
                disabled={!!subscribing}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded text-sm disabled:opacity-50"
              >
                {subscribing === key ? 'Processing...' : key === 'FREE' ? 'Downgrade' : 'Subscribe'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
