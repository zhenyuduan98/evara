'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: string;
  averageRating: number;
  images: { url: string; alt: string | null }[];
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products?limit=8&sort=reviewCount')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || d || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white p-5 rounded-sm shadow">
      <h2 className="text-xl font-bold text-amazon-dark mb-4">Recommended for You</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {(products.length > 0 ? products : Array.from({ length: 8 })).map((p, i) => {
          const product = p as Product | undefined;
          return (
            <Link key={product?.id || i} href={product ? `/products/${product.slug}` : '#'} className="flex-shrink-0 w-40 no-underline">
              <div className="bg-gray-100 rounded-md h-40 flex items-center justify-center text-3xl relative overflow-hidden">
                {product?.images?.[0] ? (
                  <Image src={product.images[0].url} alt={product.images[0].alt || ''} className="h-full object-contain"  fill sizes="(max-width: 768px) 100vw, 50vw" />
                ) : '📦'}
              </div>
              <p className="text-sm mt-2 text-gray-800 line-clamp-2">{product?.title || `Product ${i + 1}`}</p>
              <p className="text-amazon-dark font-bold text-sm">${product?.price || (19.99 + i * 10).toFixed(2)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
