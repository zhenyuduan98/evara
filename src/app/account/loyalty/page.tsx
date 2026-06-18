'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  points: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function LoyaltyPage() {
  const [points, setPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redeemAmount, setRedeemAmount] = useState('');
  const userId = 'demo-user';

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    const res = await fetch(`/api/loyalty/balance?userId=${userId}`);
    const data = await res.json();
    setPoints(data.points || 0);
    setLifetimePoints(data.lifetimePoints || 0);
    setTransactions(data.transactions || []);
  };

  const handleRedeem = async () => {
    const pts = parseInt(redeemAmount);
    if (!pts || pts <= 0) return;
    const res = await fetch('/api/loyalty/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, points: pts }),
    });
    if (res.ok) {
      setRedeemAmount('');
      loadBalance();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Loyalty Points</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-4xl font-bold text-yellow-600">{points.toLocaleString()}</p>
          <p className="text-gray-600">Available Points</p>
          <p className="text-sm text-gray-400">≈ ${(points / 100).toFixed(2)} value</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-4xl font-bold text-green-600">{lifetimePoints.toLocaleString()}</p>
          <p className="text-gray-600">Lifetime Points</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">Redeem Points</h3>
          <input
            type="number"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(e.target.value)}
            placeholder="Points to redeem"
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <button
            onClick={handleRedeem}
            className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
          >
            Redeem
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-sm text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-bold ${t.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {t.points > 0 ? '+' : ''}{t.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
