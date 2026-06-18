'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  images?: { url: string }[];
}

interface RegistryItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  purchasedQuantity: number;
  priority: string;
  note: string | null;
}

interface Registry {
  id: string;
  name: string;
  eventType: string;
  eventDate: string | null;
  description: string | null;
  shareCode: string;
  items: RegistryItem[];
}

export default function RegistryDetailPage() {
  const params = useParams();
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState('MEDIUM');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`/api/gift-registry/${params.id}`)
      .then((r) => r.json())
      .then(setRegistry)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/gift-registry/${params.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, priority, note: note || null }),
    });
    if (res.ok) {
      setProductId('');
      setQuantity(1);
      setNote('');
      load();
    }
  };

  const removeItem = async (itemId: string) => {
    await fetch(`/api/gift-registry/${params.id}/items/${itemId}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!registry) return <div className="p-8">Registry not found</div>;

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/gift-registry/share/${registry.shareCode}`;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/gift-registry" className="text-blue-600 hover:underline mb-4 block">← Back to registries</Link>
      <h1 className="text-3xl font-bold mb-2">{registry.name}</h1>
      <p className="text-gray-500 mb-1">{registry.eventType.replace('_', ' ')}</p>
      {registry.eventDate && <p className="text-gray-400 mb-1">Date: {new Date(registry.eventDate).toLocaleDateString()}</p>}
      {registry.description && <p className="text-gray-600 mb-4">{registry.description}</p>}

      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <p className="font-medium mb-1">Share this registry:</p>
        <code className="text-sm bg-white px-2 py-1 rounded border break-all">{shareUrl}</code>
      </div>

      <h2 className="text-xl font-semibold mb-4">Items ({registry.items.length})</h2>
      {registry.items.length > 0 && (
        <div className="space-y-3 mb-6">
          {registry.items.map((item) => (
            <div key={item.id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{item.product.title}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.purchasedQuantity}/{item.quantity} • Priority: {item.priority}
                </p>
                {item.note && <p className="text-sm text-gray-400">{item.note}</p>}
              </div>
              <button onClick={() => removeItem(item.id)} className="text-red-600 hover:underline text-sm">Remove</button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addItem} className="bg-white border rounded p-6 space-y-4">
        <h3 className="font-semibold">Add Item</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Product ID</label>
          <input value={productId} onChange={(e) => setProductId(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Note (optional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Add Item</button>
      </form>
    </div>
  );
}
