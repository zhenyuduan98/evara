'use client';

import { useState } from 'react';

export default function GiftCardsPage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setMessage('');
    setError('');
    const res = await fetch('/api/gift-cards/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMessage(`Gift card redeemed! $${Number(data.amount).toFixed(2)} added to your wallet.`);
      setCode('');
    } else {
      setError(data.error || 'Failed to redeem');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Redeem Gift Card</h1>

      <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-xl p-8 text-white mb-6 text-center">
        <p className="text-lg mb-2">🎁 Have a gift card?</p>
        <p className="text-sm opacity-80">Enter your code below to add funds to your wallet</p>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Enter gift card code" className="border rounded px-3 py-3 w-full text-center text-lg tracking-widest font-mono" />
        <button onClick={handleRedeem} disabled={loading || !code.trim()}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 px-6 py-3 rounded font-semibold w-full">
          {loading ? 'Redeeming...' : 'Redeem Gift Card'}
        </button>
        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}
