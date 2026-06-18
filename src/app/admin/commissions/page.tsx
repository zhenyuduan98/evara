'use client';

import { useState, useEffect } from 'react';

export default function AdminCommissionsPage() {
  const [rates, setRates] = useState<Array<{ id: string; categoryId?: string; sellerId?: string; rate: string; type: string; createdAt: string }>>([]);
  const [rate, setRate] = useState('');
  const [type, setType] = useState('PERCENTAGE');
  const [categoryId, setCategoryId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchRates(); }, []);

  async function fetchRates() {
    const res = await fetch('/api/admin/commissions');
    if (res.ok) { const data = await res.json(); setRates(data.rates || []); }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/admin/commissions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate: parseFloat(rate), type, categoryId: categoryId || undefined, sellerId: sellerId || undefined }),
    });
    setRate('');
    setCategoryId('');
    setSellerId('');
    await fetchRates();
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Commission Rates</h1>

      <form onSubmit={create} className="grid grid-cols-2 gap-3 mb-8">
        <input value={rate} onChange={e => setRate(e.target.value)} className="border rounded p-2" placeholder="Rate (e.g. 15.00)" type="number" step="0.01" required />
        <select value={type} onChange={e => setType(e.target.value)} className="border rounded p-2">
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed</option>
        </select>
        <input value={categoryId} onChange={e => setCategoryId(e.target.value)} className="border rounded p-2" placeholder="Category ID (optional)" />
        <input value={sellerId} onChange={e => setSellerId(e.target.value)} className="border rounded p-2" placeholder="Seller ID (optional)" />
        <button type="submit" disabled={loading} className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">Add Rate</button>
      </form>

      <table className="w-full border-collapse">
        <thead><tr className="border-b"><th className="text-left p-2">Rate</th><th className="text-left p-2">Type</th><th className="text-left p-2">Category</th><th className="text-left p-2">Seller</th><th className="text-left p-2">Created</th></tr></thead>
        <tbody>
          {rates.map(r => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.rate}{r.type === 'PERCENTAGE' ? '%' : ' (fixed)'}</td>
              <td className="p-2">{r.type}</td>
              <td className="p-2">{r.categoryId || 'All'}</td>
              <td className="p-2">{r.sellerId || 'All'}</td>
              <td className="p-2">{new Date(r.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rates.length === 0 && <p className="text-gray-500 mt-4">No commission rates configured.</p>}
    </div>
  );
}
