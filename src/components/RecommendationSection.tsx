'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  averageRating: number;
  image: string | null;
}

interface RecommendationSectionProps {
  title: string;
  fetchUrl: string;
  fallback?: React.ReactNode;
}

export default function RecommendationSection({ title, fetchUrl, fallback }: RecommendationSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(fetchUrl)
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchUrl]);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 h-56 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return fallback ? <>{fallback}</> : null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {products.map(p => (
          <Link key={p.id} href={`/products/${p.slug}`} className="flex-shrink-0 w-40 no-underline group">
            {p.image ? (
              <Image
                src={p.image}
                alt={p.title}
                className="w-40 h-40 object-contain bg-gray-50 rounded group-hover:shadow-md transition-shadow"
                width={160}
                height={160}
              />
            ) : (
              <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-3xl">📦</div>
            )}
            <p className="text-sm mt-2 text-gray-800 line-clamp-2 group-hover:text-amazon-orange">{p.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-500 text-xs">{'★'.repeat(Math.round(p.averageRating))}</span>
            </div>
            <p className="text-amazon-dark font-bold text-sm">${p.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
