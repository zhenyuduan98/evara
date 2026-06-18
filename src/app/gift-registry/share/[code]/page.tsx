'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  price: number;
}

interface RegistryItem {
  id: string;
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
  user: { name: string | null };
  items: RegistryItem[];
}

export default function SharedRegistryPage() {
  const params = useParams();
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/gift-registry/share/${params.code}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setRegistry)
      .finally(() => setLoading(false));
  }, [params.code]);

  useEffect(() => { load(); }, [load]);

  const purchase = async (itemId: string) => {
    setPurchasing(itemId);
    await fetch(`/api/gift-registry/share/${params.code}/purchase/${itemId}`, { method: 'POST' });
    load();
    setPurchasing(null);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!registry) return <div className="p-8">Registry not found or is private.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">🎁 {registry.name}</h1>
      <p className="text-gray-500 mb-1">By {registry.user.name || 'Anonymous'} • {registry.eventType.replace('_', ' ')}</p>
      {registry.eventDate && <p className="text-gray-400 mb-1">Date: {new Date(registry.eventDate).toLocaleDateString()}</p>}
      {registry.description && <p className="text-gray-600 mb-4">{registry.description}</p>}

      <h2 className="text-xl font-semibold mb-4 mt-6">Gift Items</h2>
      {registry.items.length === 0 ? (
        <p className="text-gray-500">No items in this registry yet.</p>
      ) : (
        <div className="space-y-3">
          {registry.items.map((item) => {
            const remaining = item.quantity - item.purchasedQuantity;
            return (
              <div key={item.id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.product.title}</p>
                  <p className="text-sm text-gray-500">
                    ${Number(item.product.price).toFixed(2)} • Priority: {item.priority}
                  </p>
                  <p className="text-sm text-gray-500">
                    {remaining > 0 ? `${remaining} of ${item.quantity} still needed` : '✅ Fully purchased'}
                  </p>
                  {item.note && <p className="text-sm text-gray-400 italic">{item.note}</p>}
                </div>
                {remaining > 0 && (
                  <button
                    onClick={() => purchase(item.id)}
                    disabled={purchasing === item.id}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {purchasing === item.id ? 'Purchasing...' : 'Purchase'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
