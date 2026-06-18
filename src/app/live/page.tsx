'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LiveStreamItem {
  id: string;
  title: string;
  description: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  scheduledAt: string;
  viewerCount: number;
  thumbnailUrl: string | null;
  seller: { id: string; name: string | null; image: string | null };
  _count: { products: number; comments: number };
}

const statusColors: Record<string, string> = {
  LIVE: 'bg-red-600 text-white',
  SCHEDULED: 'bg-yellow-500 text-black',
  ENDED: 'bg-gray-500 text-white',
};

export default function LivePage() {
  const [streams, setStreams] = useState<LiveStreamItem[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter ? `/api/live/streams?status=${filter}` : '/api/live/streams';
    fetch(url)
      .then((r) => r.json())
      .then(setStreams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🔴 Live Shopping</h1>

      <div className="flex gap-2 mb-6">
        {['', 'LIVE', 'SCHEDULED', 'ENDED'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setLoading(true); }}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading streams...</p>
      ) : streams.length === 0 ? (
        <p className="text-gray-500">No streams found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <Link key={stream.id} href={`/live/${stream.id}`}>
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div
                  className="h-48 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center relative"
                >
                  <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${statusColors[stream.status]}`}>
                    {stream.status}
                  </span>
                  {stream.status === 'LIVE' && (
                    <span className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      👁 {stream.viewerCount}
                    </span>
                  )}
                  <span className="text-white text-4xl">📺</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">{stream.title}</h3>
                  <p className="text-sm text-gray-500">{stream.seller.name || 'Seller'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(stream.scheduledAt).toLocaleString()} · {stream._count.products} products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
