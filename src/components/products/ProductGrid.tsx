'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Rating from '@/components/ui/Rating';
import Badge from '@/components/ui/Badge';
import PromotionBadge from '@/components/deals/PromotionBadge';
import { formatPrice, calculateSavings } from '@/lib/format';

interface ProductPromotion {
  type: string;
  value: number;
}

interface ProductCardItem {
  id: string;
  title: string;
  slug: string;
  brand: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  averageRating: number;
  reviewCount: number;
  images: { url: string; alt?: string | null }[];
  variants?: { stock: number }[];
  promotion?: ProductPromotion | null;
  isSponsored?: boolean;
}

export function ViewToggle({ view, onChange }: { view: 'grid' | 'list'; onChange: (v: 'grid' | 'list') => void }) {
  return (
    <div className="flex gap-1 border rounded overflow-hidden">
      <button
        onClick={() => onChange('grid')}
        className={`p-2 ${view === 'grid' ? 'bg-amazon-light text-white' : 'bg-white text-gray-600'}`}
        aria-label="Grid view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><rect x="0" y="0" width="7" height="7"/><rect x="9" y="0" width="7" height="7"/><rect x="0" y="9" width="7" height="7"/><rect x="9" y="9" width="7" height="7"/></svg>
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-2 ${view === 'list' ? 'bg-amazon-light text-white' : 'bg-white text-gray-600'}`}
        aria-label="List view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><rect x="0" y="0" width="16" height="3"/><rect x="0" y="5" width="16" height="3"/><rect x="0" y="10" width="16" height="3"/></svg>
      </button>
    </div>
  );
}

export default function ProductGrid({ products }: { products: ProductCardItem[] }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const isPrime = true; // Simplified: show prime badge on all

  return (
    <div className="flex-1">
      <div className="flex justify-end mb-3">
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group border rounded-lg p-3 bg-white hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="relative w-full aspect-square bg-gray-100 rounded overflow-hidden mb-3">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.title}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {product.promotion && (
                  <div className="absolute top-2 left-2">
                    <PromotionBadge type={product.promotion.type} value={product.promotion.value} />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-amazon-orange mb-1">{product.title}</h3>
              {product.isSponsored && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 mb-1">Sponsored</span>
              )}
              <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
              <div className="flex items-center gap-1 mb-1">
                <Rating value={product.averageRating} size="sm" />
                <span className="text-xs text-amazon-blue">{product.reviewCount.toLocaleString()}</span>
              </div>
              <div className="mt-auto">
                <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.compareAtPrice)}</span>
                )}
                {product.compareAtPrice && (() => {
                  const s = calculateSavings(product.price, product.compareAtPrice);
                  return <span className="text-xs text-red-600 ml-1">({s.percent}% off)</span>;
                })()}
              </div>
              {isPrime && (
                <div className="mt-1"><Badge variant="info" size="sm">prime</Badge></div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow flex gap-4"
            >
              <div className="relative w-48 h-48 shrink-0 bg-gray-100 rounded overflow-hidden">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.title}
                    fill
                    className="object-contain"
                    sizes="192px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="text-base font-medium line-clamp-2 group-hover:text-amazon-orange">{product.title}</h3>
                {product.isSponsored && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 w-fit">Sponsored</span>
                )}
                <p className="text-xs text-gray-500">{product.brand}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Rating value={product.averageRating} size="sm" />
                  <span className="text-xs text-amazon-blue">{product.reviewCount.toLocaleString()}</span>
                </div>
                <div className="mt-2">
                  <span className="text-xl font-bold">{formatPrice(product.price)}</span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.compareAtPrice)}</span>
                  )}
                  {product.compareAtPrice && (() => {
                    const s = calculateSavings(product.price, product.compareAtPrice);
                    return <span className="text-xs text-red-600 ml-1">({s.percent}% off)</span>;
                  })()}
                </div>
                {isPrime && (
                  <div className="mt-1"><Badge variant="info" size="sm">prime</Badge></div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}
