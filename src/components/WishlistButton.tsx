'use client';

import { useState } from 'react';

export default function WishlistButton({ productId, initialWishlisted = false }: { productId: string; initialWishlisted?: boolean }) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      if (wishlisted) {
        await fetch('/api/wishlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
        setWishlisted(false);
      } else {
        await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
        setWishlisted(true);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-2xl transition-colors ${wishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {wishlisted ? '♥' : '♡'}
    </button>
  );
}
