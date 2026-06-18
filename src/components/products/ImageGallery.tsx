'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: { id: string; url: string; alt?: string | null; position: number }[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [selected, setSelected] = useState(0);
  const current = sorted[selected] || null;

  if (!current) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400">
        No Images Available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-square bg-white border rounded-lg overflow-hidden">
        <Image
          src={current.url}
          alt={current.alt || 'Product image'}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 shrink-0 border-2 rounded overflow-hidden ${
                i === selected ? 'border-amazon-orange' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image src={img.url} alt={img.alt || ''} fill className="object-contain" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
