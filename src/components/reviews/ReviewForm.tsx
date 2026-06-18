'use client';

import React, { useState } from 'react';
import Rating from '@/components/ui/Rating';

interface Props {
  productId: string;
  onSubmit?: () => void;
}

export default function ReviewForm({ productId, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError('Please select a rating'); return; }
    if (!title.trim() || !body.trim()) { setError('Title and body are required'); return; }
    setLoading(true);
    setError('');

    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, title, body }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to submit review');
      setLoading(false);
      return;
    }

    setRating(0); setTitle(''); setBody('');
    setLoading(false);
    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4 bg-gray-50">
      <h3 className="font-bold text-lg">Write a Review</h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <Rating value={rating} size="lg" onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="Summary of your review" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Review</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
          className="w-full border rounded px-3 py-2 text-sm" placeholder="What did you like or dislike?" />
      </div>

      <button type="submit" disabled={loading}
        className="bg-amazon-yellow hover:bg-amazon-orange text-amazon-dark font-bold px-6 py-2 rounded text-sm disabled:opacity-50">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
