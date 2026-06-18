'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecommendedProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  averageRating: number;
  image: string | null;
}

export default function Recommendations({ productId }: { productId: string }) {
  const [alsoBought, setAlsoBought] = useState<RecommendedProduct[]>([]);
  const [fbt, setFbt] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    fetch(`/api/recommendations/${productId}`)
      .then(r => r.json())
      .then(data => {
        setAlsoBought(data.alsoBought || []);
        setFbt(data.frequentlyBoughtTogether || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    // Get current product price from page
    const priceEl = document.querySelector('[data-product-price]');
    if (priceEl) setCurrentPrice(Number(priceEl.getAttribute('data-product-price')) || 0);
  }, []);

  if (loading) return null;

  const fbtTotal = fbt.reduce((sum, p) => sum + p.price, 0) + currentPrice;

  return (
    <div className="space-y-8">
      {/* Frequently Bought Together */}
      {fbt.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Frequently Bought Together</h2>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <div className="text-center flex-shrink-0">
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">This item</div>
            </div>
            {fbt.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 flex-shrink-0">
                <span className="text-2xl text-gray-400">+</span>
                <Link href={`/products/${p.slug}`} className="text-center w-24">
                  {p.image ? (
                    <Image src={p.image} alt={p.title} className="w-24 h-24 object-contain"  width={96} height={96} />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">📦</div>
                  )}
                  <p className="text-xs mt-1 line-clamp-2">{p.title}</p>
                </Link>
              </div>
            ))}
            <div className="flex-shrink-0 ml-4 p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Total price:</p>
              <p className="text-lg font-bold text-red-700">${fbtTotal.toFixed(2)}</p>
              <button className="mt-2 bg-amazon-yellow px-4 py-1 rounded text-sm font-medium hover:bg-amazon-orange">
                Add all to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customers Also Bought */}
      {alsoBought.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Customers Who Bought This Also Bought</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {alsoBought.map(p => (
              <Link key={p.id} href={`/products/${p.slug}`} className="flex-shrink-0 w-40 no-underline">
                {p.image ? (
                  <Image src={p.image} alt={p.title} className="w-40 h-40 object-contain bg-gray-50 rounded"  width={160} height={160} />
                ) : (
                  <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-3xl">📦</div>
                )}
                <p className="text-sm mt-2 text-gray-800 line-clamp-2">{p.title}</p>
                <p className="text-amazon-dark font-bold text-sm">${p.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
