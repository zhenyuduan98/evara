'use client';

import { useEffect } from 'react';
import { trackRecentlyViewed } from '@/components/home/RecentlyViewed';

interface ViewTrackerProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: string;
    image?: string;
  };
}

export default function ViewTracker({ product }: ViewTrackerProps) {
  useEffect(() => {
    trackRecentlyViewed(product);
    // Track VIEW behavior for recommendation engine
    fetch('/api/behaviors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, action: 'VIEW' }),
    }).catch(() => {});
  }, [product]);

  return null;
}
