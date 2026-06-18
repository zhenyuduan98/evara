'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BarcodeSearchButton() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/search/barcode?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (res.ok && data.product) {
        setOpen(false);
        router.push(`/products/${data.product.slug}`);
      } else {
        setError(data.error || 'Product not found');
      }
    } catch {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-white hover:text-amazon-orange p-1"
        aria-label="Search by barcode"
        title="Search by barcode"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h2v16H3V4zm4 0h1v16H7V4zm3 0h2v16h-2V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm3 0h2v16h-2V4z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Barcode Search</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter UPC, EAN, or ISBN..."
                className="w-full border rounded px-3 py-2 text-sm text-black dark:text-white dark:bg-gray-700 mb-3"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amazon-orange hover:bg-amazon-yellow text-black font-semibold py-2 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
