'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ViewedProduct {
  id: string;
  title: string;
  slug: string;
  price: string;
  image?: string;
}

const STORAGE_KEY = 'recently_viewed';

export function trackRecentlyViewed(product: ViewedProduct) {
  if (typeof window === 'undefined') return;
  const items: ViewedProduct[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const filtered = items.filter((p) => p.id !== product.id);
  filtered.unshift(product);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
}

export default function RecentlyViewed() {
  const [products, setProducts] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setProducts(items);
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-sm shadow">
      <h2 className="text-xl font-bold text-amazon-dark mb-4">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="flex-shrink-0 w-40 no-underline">
            <div className="bg-gray-100 rounded-md h-40 flex items-center justify-center text-3xl relative overflow-hidden">
              {p.image ? <Image src={p.image} alt={p.title} className="h-full object-contain"  fill sizes="(max-width: 768px) 100vw, 50vw" /> : '📦'}
            </div>
            <p className="text-sm mt-2 text-gray-800 line-clamp-2">{p.title}</p>
            <p className="text-amazon-dark font-bold text-sm">${p.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
