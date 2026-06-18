'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';
import Rating from '@/components/ui/Rating';

interface FilterSidebarProps {
  categories: { id: string; name: string; slug: string; children?: { id: string; name: string; slug: string }[] }[];
  brands: string[];
  attributeFilters?: { key: string; values: string[] }[];
}

export default function FilterSidebar({ categories, brands, attributeFilters = [] }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const activeCategory = searchParams.get('category') || '';
  const activeRating = searchParams.get('rating') || '';
  const activeBrands = searchParams.get('brands')?.split(',').filter(Boolean) || [];

  const toggleBrand = (brand: string) => {
    const next = activeBrands.includes(brand)
      ? activeBrands.filter(b => b !== brand)
      : [...activeBrands, brand];
    updateParam('brands', next.length ? next.join(',') : null);
  };

  const getActiveAttrValues = (key: string): string[] => {
    const paramKey = `attr_${key}`;
    return searchParams.get(paramKey)?.split(',').filter(Boolean) || [];
  };

  const toggleAttrValue = (key: string, value: string) => {
    const paramKey = `attr_${key}`;
    const active = getActiveAttrValues(key);
    const next = active.includes(value)
      ? active.filter(v => v !== value)
      : [...active, value];
    updateParam(paramKey, next.length ? next.join(',') : null);
  };

  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-6 text-sm">
      {/* Categories */}
      <div>
        <h3 className="font-bold mb-2">Department</h3>
        <ul className="space-y-1">
          {categories.map(cat => (
            <li key={cat.id}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => updateParam('category', cat.slug === activeCategory ? null : cat.slug)}
                  className={`hover:text-amazon-orange ${activeCategory === cat.slug ? 'font-bold text-amazon-orange' : ''}`}
                >
                  {cat.name}
                </button>
                {cat.children && cat.children.length > 0 && (
                  <button
                    onClick={() => setExpandedCats(prev => {
                      const next = new Set(prev);
                      if (next.has(cat.id)) { next.delete(cat.id); } else { next.add(cat.id); }
                      return next;
                    })}
                    className="text-gray-500 px-1"
                  >
                    {expandedCats.has(cat.id) ? '−' : '+'}
                  </button>
                )}
              </div>
              {expandedCats.has(cat.id) && cat.children && (
                <ul className="ml-3 mt-1 space-y-1">
                  {cat.children.map(child => (
                    <li key={child.id}>
                      <button
                        onClick={() => updateParam('category', child.slug === activeCategory ? null : child.slug)}
                        className={`hover:text-amazon-orange ${activeCategory === child.slug ? 'font-bold text-amazon-orange' : ''}`}
                      >
                        {child.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold mb-2">Price</h3>
        <div className="mb-2">
          <input
            type="range"
            min={0}
            max={2000}
            step={10}
            value={maxPrice || 2000}
            onChange={e => setMaxPrice(e.target.value === '2000' ? '' : e.target.value)}
            className="w-full accent-amazon-orange"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>$0</span>
            <span>${maxPrice || '2000+'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            className="w-20 border rounded px-2 py-1 text-sm"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="w-20 border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
              if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
              params.delete('page');
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="bg-amazon-yellow px-2 py-1 rounded text-sm font-medium"
          >
            Go
          </button>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-bold mb-2">Customer Review</h3>
        <ul className="space-y-1">
          {[4, 3, 2, 1].map(r => (
            <li key={r}>
              <button
                onClick={() => updateParam('rating', activeRating === String(r) ? null : String(r))}
                className={`flex items-center gap-1 hover:text-amazon-orange ${activeRating === String(r) ? 'font-bold' : ''}`}
              >
                <Rating value={r} size="sm" /> <span>& Up</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">Brand</h3>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {brands.map(brand => (
              <li key={brand}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="accent-amazon-orange"
                  />
                  {brand}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dynamic Attribute Filters */}
      {attributeFilters.map(attr => (
        <div key={attr.key}>
          <h3 className="font-bold mb-2">{attr.key}</h3>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {attr.values.map(val => {
              const active = getActiveAttrValues(attr.key);
              return (
                <li key={val}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active.includes(val)}
                      onChange={() => toggleAttrValue(attr.key, val)}
                      className="accent-amazon-orange"
                    />
                    {val}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
