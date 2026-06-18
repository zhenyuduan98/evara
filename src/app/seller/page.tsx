'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerRegistrationPage() {
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/seller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, description, logo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      router.push('/seller/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Become a Seller</h1>
      <p className="text-gray-600 mb-8">Start selling your products on Evara. Fill in your business details below.</p>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name *</label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full border rounded-md p-3" placeholder="Your business name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border rounded-md p-3" placeholder="Tell customers about your business" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <input type="url" value={logo} onChange={(e) => setLogo(e.target.value)} className="w-full border rounded-md p-3" placeholder="https://example.com/logo.png" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-amazon-orange hover:bg-amazon-yellow text-black font-bold py-3 rounded-md disabled:opacity-50">
          {loading ? 'Registering...' : 'Register as Seller'}
        </button>
      </form>
    </div>
  );
}
