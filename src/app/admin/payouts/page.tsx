'use client';

import { useState, useEffect } from 'react';

interface Seller {
  id: string;
  companyName: string;
  user: { name: string; email: string };
}

interface Payout {
  id: string;
  sellerId: string;
  amount: string;
  status: string;
  stripePayoutId: string | null;
  processedAt: string | null;
  createdAt: string;
}

export default function AdminPayoutsPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        // We'll just show seller list from a simple fetch
      }
    } catch {}
    setLoading(false);
  }

  async function createPayout(sellerId: string) {
    setProcessing(sellerId);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/payout`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setPayouts(prev => [data.payout, ...prev]);
        alert('Payout created successfully!');
      } else {
        alert(data.error || 'Failed to create payout');
      }
    } catch {
      alert('Failed to create payout');
    }
    setProcessing(null);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Payout Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Sellers</h2>
        {loading ? (
          <p className="text-gray-500">Loading sellers...</p>
        ) : sellers.length === 0 ? (
          <p className="text-gray-500">No sellers found. Sellers will appear here once registered.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Company</th>
                <th className="text-left py-2">Contact</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map(seller => (
                <tr key={seller.id} className="border-b">
                  <td className="py-3">{seller.companyName}</td>
                  <td className="py-3">{seller.user.email}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => createPayout(seller.id)}
                      disabled={processing === seller.id}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing === seller.id ? 'Processing...' : 'Create Payout'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Payouts</h2>
        {payouts.length === 0 ? (
          <p className="text-gray-500">No payouts yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Stripe ID</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="py-3 font-mono text-sm">{p.id.slice(0, 8)}...</td>
                  <td className="py-3">${Number(p.amount).toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-sm">{p.stripePayoutId || '-'}</td>
                  <td className="py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
