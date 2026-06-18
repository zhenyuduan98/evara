'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Showcase {
  id: string;
  title: string;
  content: string;
  images: string[] | null;
  likes: number;
  createdAt: string;
  user: { name: string | null; image: string | null };
  product: { id: string; title: string; slug: string; images: { url: string }[] };
}

export default function ShowcasePage() {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/buyer-showcase?page=${page}&limit=12`)
      .then(r => r.json())
      .then(data => {
        setShowcases(data.showcases || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Buyer Showcase</h1>
      <p className="text-gray-600 mb-8">See what our community is buying and loving!</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-64" />
          ))}
        </div>
      ) : showcases.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No showcases yet. Be the first to share!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcases.map(s => (
            <div key={s.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {s.images && Array.isArray(s.images) && s.images.length > 0 ? (
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={s.images[0]} alt={s.title} className="w-full h-full object-cover" />
                </div>
              ) : s.product.images?.[0] ? (
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={s.product.images[0].url} alt={s.product.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{s.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{s.content}</p>
                <Link href={`/products/${s.product.slug}`} className="text-xs text-amazon-blue hover:underline">
                  {s.product.title}
                </Link>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>{s.user.name || 'Customer'}</span>
                  <div className="flex items-center gap-2">
                    <span>❤️ {s.likes}</span>
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
