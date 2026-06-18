'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Avg. Customer Review' },
  { value: 'newest', label: 'Newest Arrivals' },
];

export default function SortBar({ totalResults, query }: { totalResults: number; query?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'featured';

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const page = Number(searchParams.get('page') || '1');
  const perPage = 24;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalResults);
  const totalStr = totalResults > 1000 ? `${Math.floor(totalResults / 1000).toLocaleString()},000+` : totalResults.toLocaleString();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-sm">
      <span className="text-gray-600">
        Showing {start}-{end} of {totalStr} results{query ? ` for "${query}"` : ''}
      </span>
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-gray-600">Sort by:</label>
        <select
          id="sort"
          value={currentSort}
          onChange={e => setSort(e.target.value)}
          className="border rounded px-2 py-1 text-sm bg-white"
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
