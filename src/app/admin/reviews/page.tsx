'use client';

import { useEffect, useState } from 'react';

interface ReviewFlag {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface Review {
  id: string;
  title: string;
  body: string;
  rating: number;
  hidden: boolean;
  user: { name: string; email: string };
  product: { title: string };
  flags: ReviewFlag[];
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    fetch('/api/admin/reviews')
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const moderate = async (id: string, action: string) => {
    await fetch(`/api/admin/reviews/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchReviews();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Review Moderation</h1>
      <div className="space-y-4">
        {reviews.length === 0 && <p className="text-gray-500">No reviews to moderate.</p>}
        {reviews.map((r) => (
          <div key={r.id} className={`border rounded-lg p-4 ${r.hidden ? 'bg-red-50' : r.flags.length > 0 ? 'bg-yellow-50' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{r.title} — {'⭐'.repeat(r.rating)}</h3>
                <p className="text-sm text-gray-500">by {r.user?.name || r.user?.email} on {r.product?.title}</p>
                <p className="mt-2 text-sm">{r.body}</p>
                {r.flags.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-red-600">🚩 {r.flags.length} flag(s):</span>
                    {r.flags.map((f) => (
                      <span key={f.id} className="ml-2 text-xs bg-red-100 px-2 py-0.5 rounded">{f.reason}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {r.hidden ? (
                  <button onClick={() => moderate(r.id, 'approve')} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Restore</button>
                ) : (
                  <>
                    <button onClick={() => moderate(r.id, 'approve')} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                    <button onClick={() => moderate(r.id, 'hide')} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Hide</button>
                    <button onClick={() => moderate(r.id, 'reject')} className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">Reject</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
