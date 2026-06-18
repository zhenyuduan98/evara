'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function ActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: { label: string; key: string; value?: string }[] = [];

  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const rating = searchParams.get('rating');
  const brands = searchParams.get('brands');

  if (q) filters.push({ label: `Search: "${q}"`, key: 'q' });
  if (category) filters.push({ label: `Category: ${category}`, key: 'category' });
  if (minPrice || maxPrice) filters.push({ label: `Price: $${minPrice || '0'} - $${maxPrice || '∞'}`, key: 'minPrice' });
  if (rating) filters.push({ label: `${rating}★ & Up`, key: 'rating' });
  if (brands) {
    brands.split(',').filter(Boolean).forEach(b => {
      filters.push({ label: `Brand: ${b}`, key: 'brands', value: b });
    });
  }

  // Attribute filters
  searchParams.forEach((value, key) => {
    if (key.startsWith('attr_')) {
      const attrName = key.slice(5);
      value.split(',').filter(Boolean).forEach(v => {
        filters.push({ label: `${attrName}: ${v}`, key, value: v });
      });
    }
  });

  if (filters.length === 0) return null;

  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'minPrice') {
      params.delete('minPrice');
      params.delete('maxPrice');
    } else if (value && (key === 'brands' || key.startsWith('attr_'))) {
      const current = params.get(key)?.split(',').filter(Boolean) || [];
      const next = current.filter(v => v !== value);
      if (next.length) params.set(key, next.join(','));
      else params.delete(key);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
      {filters.map((f, i) => (
        <span
          key={`${f.key}-${f.value || i}`}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-800"
        >
          {f.label}
          <button
            onClick={() => removeFilter(f.key, f.value)}
            className="ml-1 text-blue-500 hover:text-red-500 font-bold"
          >
            ×
          </button>
        </span>
      ))}
      <button onClick={clearAll} className="text-xs text-red-600 hover:underline ml-2">
        Clear all
      </button>
    </div>
  );
}
