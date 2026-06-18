'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    brand: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    bulletPoints: [''],
    imageUrl: '',
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body = {
        title: form.title,
        description: form.description,
        brand: form.brand,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        sku: form.sku,
        bulletPoints: form.bulletPoints.filter(Boolean),
        images: form.imageUrl ? [{ url: form.imageUrl, alt: form.title }] : [],
      };
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');
      router.push('/seller/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required className="w-full border rounded-md p-3" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand *</label>
          <input type="text" value={form.brand} onChange={(e) => set('brand', e.target.value)} required className="w-full border rounded-md p-3" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price *</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} required className="w-full border rounded-md p-3" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Compare At Price</label>
            <input type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} className="w-full border rounded-md p-3" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SKU *</label>
          <input type="text" value={form.sku} onChange={(e) => set('sku', e.target.value)} required className="w-full border rounded-md p-3" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className="w-full border rounded-md p-3" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input type="url" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} className="w-full border rounded-md p-3" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bullet Points</label>
          {form.bulletPoints.map((bp, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={bp}
                onChange={(e) => {
                  const newBp = [...form.bulletPoints];
                  newBp[i] = e.target.value;
                  setForm((f) => ({ ...f, bulletPoints: newBp }));
                }}
                className="flex-1 border rounded-md p-2"
                placeholder={`Feature ${i + 1}`}
              />
              {i === form.bulletPoints.length - 1 && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, bulletPoints: [...f.bulletPoints, ''] }))} className="px-3 py-2 bg-gray-200 rounded-md">+</button>
              )}
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-amazon-orange hover:bg-amazon-yellow text-black font-bold py-3 rounded-md disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
