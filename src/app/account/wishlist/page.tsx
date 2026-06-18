'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: { url: string }[];
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); })
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (productId: string) => {
    await fetch('/api/wishlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty. Browse products and click the heart icon to save them.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4 relative">
              <button onClick={() => removeItem(item.productId)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl">♥</button>
              <Link href={`/products/${item.product.slug}`}>
                <div className="aspect-square relative mb-3 bg-gray-50 rounded">
                  {item.product.images[0] && (
                    <Image src={item.product.images[0].url} alt={item.product.title} fill className="object-contain" />
                  )}
                </div>
                <h3 className="text-sm font-medium line-clamp-2">{item.product.title}</h3>
                <p className="text-lg font-bold mt-1">${Number(item.product.price).toFixed(2)}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
