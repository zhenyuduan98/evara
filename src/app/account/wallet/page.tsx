'use client';

import { useEffect, useState } from 'react';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [topupAmount, setTopupAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchWallet = () => {
    fetch('/api/wallet').then(r => r.json()).then(data => {
      setBalance(data.balance || 0);
      setCurrency(data.currency || 'USD');
      setTransactions(data.transactions || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (!amt || amt <= 0) return;
    const res = await fetch('/api/wallet/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amt }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Added $${amt.toFixed(2)} to wallet`);
      setTopupAmount('');
      fetchWallet();
    } else {
      setMessage(data.error || 'Failed');
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white mb-6">
        <p className="text-sm opacity-80">Available Balance</p>
        <p className="text-4xl font-bold">${balance.toFixed(2)} <span className="text-lg">{currency}</span></p>
      </div>

      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Top Up Wallet</h2>
        <div className="flex gap-2">
          <input type="number" value={topupAmount} onChange={e => setTopupAmount(e.target.value)}
            placeholder="Amount" className="border rounded px-3 py-2 flex-1" min="1" step="0.01" />
          <button onClick={handleTopup} className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-semibold">
            Add Funds
          </button>
        </div>
        {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id as string} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="text-sm">{t.description as string}</p>
                  <p className="text-xs text-gray-400">{new Date(t.createdAt as string).toLocaleString()}</p>
                </div>
                <span className={`font-semibold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'CREDIT' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
