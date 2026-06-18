'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Deal {
  id: string;
  discountPercent: number;
  endDate: string;
  product: { id: string; title: string; price: string; images: { url: string; alt: string | null }[] };
}

function Countdown({ endDate }: { endDate: string }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
      setTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [endDate]);

  return (
    <span className="text-red-600 font-mono text-sm">
      {String(time.h).padStart(2, '0')}:{String(time.m).padStart(2, '0')}:{String(time.s).padStart(2, '0')}
    </span>
  );
}

export default function DealOfTheDay() {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetch('/api/deals').then((r) => r.json()).then((d) => setDeals(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  if (deals.length === 0) {
    return (
      <div className="bg-white p-5 rounded-sm shadow">
        <h2 className="text-2xl font-bold text-amazon-dark mb-4">Deal of the Day</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="bg-gray-100 rounded-md h-32 flex items-center justify-center text-4xl mb-2">🏷️</div>
              <div className="text-red-600 font-bold text-sm">Up to {20 + i * 10}% off</div>
              <p className="text-xs text-gray-600 mt-1">Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-sm shadow">
      <h2 className="text-2xl font-bold text-amazon-dark mb-4">Deal of the Day</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {deals.slice(0, 6).map((deal) => (
          <div key={deal.id} className="text-center">
            <div className="bg-gray-100 rounded-md h-32 flex items-center justify-center mb-2 relative overflow-hidden">
              {deal.product.images[0] ? (
                <Image src={deal.product.images[0].url} alt={deal.product.images[0].alt || ''} className="h-full object-contain"  fill sizes="(max-width: 768px) 100vw, 50vw" />
              ) : <span className="text-4xl">🏷️</span>}
            </div>
            <div className="text-red-600 font-bold text-sm">{deal.discountPercent}% off</div>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{deal.product.title}</p>
            <Countdown endDate={deal.endDate} />
          </div>
        ))}
      </div>
    </div>
  );
}
