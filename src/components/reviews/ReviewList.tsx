'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Rating from '@/components/ui/Rating';

interface ReviewUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  user: ReviewUser;
}

interface Props {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

export default function ReviewList({ productId, averageRating, reviewCount }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/products/${productId}/reviews?sort=${sort}&page=${page}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setPages(data.pages || 1);
    setDistribution(data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  }, [productId, sort, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleVote = async (reviewId: string, helpful: boolean) => {
    await fetch(`/api/reviews/${reviewId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helpful }),
    });
    fetchReviews();
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <Rating value={averageRating} size="lg" />
          <div className="text-sm text-gray-500 mt-1">{reviewCount} reviews</div>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-right">{star}★</span>
                <div className="flex-1 bg-gray-200 rounded h-4 overflow-hidden">
                  <div className="bg-amazon-yellow h-full rounded" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Sort by:</label>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="border rounded px-2 py-1 text-sm">
          <option value="newest">Newest</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Rating value={r.rating} size="sm" />
                <span className="font-bold">{r.title}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                By {r.user.name || 'Anonymous'} on {new Date(r.createdAt).toLocaleDateString()}
                {r.verifiedPurchase && (
                  <span className="ml-2 text-amazon-orange font-medium">Verified Purchase</span>
                )}
              </div>
              <p className="text-sm text-gray-700">{r.body}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>{r.helpfulCount} found helpful</span>
                <button onClick={() => handleVote(r.id, true)} className="text-amazon-blue hover:underline">Helpful</button>
                <button onClick={() => handleVote(r.id, false)} className="text-gray-400 hover:underline">Not helpful</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded text-sm ${page === i + 1 ? 'bg-amazon-yellow font-bold' : ''}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
