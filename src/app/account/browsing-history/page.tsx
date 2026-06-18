'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HistoryItem {
  id: string;
  viewedAt: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: { url: string }[];
  };
}

export default function BrowsingHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/browsing-history')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Browsing History</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">No browsing history yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link key={item.id} href={`/products/${item.product.slug}`} className="bg-white border rounded-lg p-4">
              <div className="aspect-square relative mb-3 bg-gray-50 rounded">
                {item.product.images[0] && (
                  <Image src={item.product.images[0].url} alt={item.product.title} fill className="object-contain" />
                )}
              </div>
              <h3 className="text-sm font-medium line-clamp-2">{item.product.title}</h3>
              <p className="text-lg font-bold mt-1">${Number(item.product.price).toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">Viewed {new Date(item.viewedAt).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
