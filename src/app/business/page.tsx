'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, taxId, industry }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Business account created successfully!');
        router.push('/business/orders');
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch {
      setMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Evara Business</h1>
      <p className="text-gray-600 mb-8">
        Register your business account to access bulk pricing, purchase order workflows, and business-only deals.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Benefits</h2>
          <ul className="space-y-3">
            {[
              'Bulk quantity discounts',
              'Purchase order approval workflows',
              'Tax-exempt purchasing',
              'Business analytics & reporting',
              'Multi-user accounts',
              'Net payment terms',
            ].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <span className="text-green-600">✓</span> {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Register Your Business</h2>
          {message && (
            <div className={`mb-4 p-3 rounded text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tax ID (EIN)</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Create Business Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
