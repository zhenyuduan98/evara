'use client';

import { useEffect, useState } from 'react';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'card', last4: '', brand: 'Visa', isDefault: false });
  const [message, setMessage] = useState('');

  const fetchMethods = () => {
    fetch('/api/payment-methods').then(r => r.json()).then(data => {
      setMethods(data.paymentMethods || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleAdd = async () => {
    if (!form.last4 || form.last4.length !== 4) { setMessage('Enter valid last 4 digits'); return; }
    const res = await fetch('/api/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ type: 'card', last4: '', brand: 'Visa', isDefault: false });
      setMessage('');
      fetchMethods();
    } else {
      const data = await res.json();
      setMessage(data.error || 'Failed');
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Payment Methods</h1>

      <button onClick={() => setShowForm(!showForm)}
        className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded font-semibold mb-4">
        + Add Payment Method
      </button>

      {showForm && (
        <div className="border rounded-lg p-4 mb-4 space-y-3">
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            className="border rounded px-3 py-2 w-full">
            <option value="card">Credit/Debit Card</option>
            <option value="bank">Bank Account</option>
          </select>
          <select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
            className="border rounded px-3 py-2 w-full">
            <option>Visa</option><option>Mastercard</option><option>Amex</option>
          </select>
          <input type="text" maxLength={4} value={form.last4} onChange={e => setForm({ ...form, last4: e.target.value.replace(/\D/g, '') })}
            placeholder="Last 4 digits" className="border rounded px-3 py-2 w-full" />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default
          </label>
          <button onClick={handleAdd} className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded font-semibold">Save</button>
          {message && <p className="text-red-600 text-sm">{message}</p>}
        </div>
      )}

      {methods.length === 0 ? (
        <p className="text-gray-500">No saved payment methods.</p>
      ) : (
        <div className="space-y-3">
          {methods.map((m) => (
            <div key={m.id as string} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{(m.brand || m.type) as string} •••• {m.last4 as string}</p>
                <p className="text-sm text-gray-500">{m.type as string}</p>
              </div>
              {Boolean(m.isDefault) && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Default</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
