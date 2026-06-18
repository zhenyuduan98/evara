'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GalleryImage {
  imageUrl: string;
  reviewId: string;
  rating: number;
  title: string;
  userName: string | null;
}

export function ReviewImageGallery({ productId }: { productId: string }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetch(`/api/products/${productId}/review-gallery`)
      .then(r => r.ok ? r.json() : [])
      .then(setImages);
  }, [productId]);

  if (images.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Customer Images</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(img)}
            className="relative w-20 h-20 flex-shrink-0 rounded border-2 border-transparent hover:border-yellow-400 overflow-hidden"
          >
            <Image src={img.imageUrl} alt={`Review by ${img.userName}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="bg-white rounded-lg max-w-lg w-full p-4" onClick={e => e.stopPropagation()}>
            <div className="relative w-full h-80 mb-3">
              <Image src={selected.imageUrl} alt={selected.title} fill className="object-contain" />
            </div>
            <p className="font-medium">{selected.title}</p>
            <p className="text-sm text-gray-500">{'⭐'.repeat(selected.rating)} — {selected.userName || 'Anonymous'}</p>
            <button onClick={() => setSelected(null)} className="mt-3 text-sm text-blue-600 hover:underline">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
