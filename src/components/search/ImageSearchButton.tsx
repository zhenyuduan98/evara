'use client';

import { useState, useRef } from 'react';

interface ImageResult {
  id: string;
  title: string;
  slug: string;
  price: string;
  image: string | null;
  similarityScore: number;
}

export default function ImageSearchButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImageResult[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOpen(true);
    setLoading(true);
    setResults([]);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/search/image', { method: 'POST', body: formData });
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={handleClick}
        className="text-white hover:text-amazon-orange p-1"
        aria-label="Search by image"
        title="Search by image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Image Search Results</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            {loading ? (
              <p className="text-center text-gray-500 py-8">Searching...</p>
            ) : results.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No similar products found</p>
            ) : (
              <div className="space-y-3">
                {results.map(p => (
                  <a key={p.id} href={`/products/${p.slug}`} className="flex gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    {p.image && <img src={p.image} alt="" className="w-12 h-12 object-cover rounded" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-2">{p.title}</p>
                      <p className="text-sm font-bold text-amazon-orange">${p.price}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
