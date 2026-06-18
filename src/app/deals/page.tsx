'use client';

import { useState, useEffect } from 'react';
import CountdownTimer from '@/components/deals/CountdownTimer';
import LightningDealBar from '@/components/deals/LightningDealBar';

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  type: string;
  value: string;
  minQuantity: number | null;
  productIds: string[];
  categoryIds: string[];
  startDate: string;
  endDate: string;
  maxClaims: number | null;
  currentClaims: number;
  isActive: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  FLASH_SALE: '⚡ Flash Sale',
  LIGHTNING_DEAL: '🔥 Lightning Deal',
  BUY_X_GET_Y: '🎁 Buy X Get Y',
  PERCENTAGE: '💰 % Off',
  FIXED: '💵 Fixed Discount',
};

const TYPE_COLORS: Record<string, string> = {
  FLASH_SALE: 'bg-red-600',
  LIGHTNING_DEAL: 'bg-orange-500',
  BUY_X_GET_Y: 'bg-purple-600',
  PERCENTAGE: 'bg-green-600',
  FIXED: 'bg-blue-600',
};

export default function DealsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter ? `/api/promotions?type=${filter}` : '/api/promotions';
    fetch(url)
      .then(r => r.json())
      .then(data => setPromotions(data.promotions || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const filters = ['', 'FLASH_SALE', 'LIGHTNING_DEAL', 'BUY_X_GET_Y', 'PERCENTAGE', 'FIXED'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Today&apos;s Deals</h1>
      <p className="text-gray-600 mb-6">Limited-time deals and promotions</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setLoading(true); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === f ? 'bg-amazon-orange text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {f ? TYPE_LABELS[f] : 'All Deals'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 h-64 rounded-lg" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">No active deals right now</p>
          <p className="text-sm mt-2">Check back soon for new promotions!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map(promo => (
            <div key={promo.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition">
              <div className={`${TYPE_COLORS[promo.type] || 'bg-gray-600'} text-white px-4 py-2 text-sm font-semibold flex justify-between items-center`}>
                <span>{TYPE_LABELS[promo.type] || promo.type}</span>
                <span className="text-xs opacity-90">
                  {promo.type === 'PERCENTAGE' || promo.type === 'FLASH_SALE'
                    ? `${Number(promo.value)}% OFF`
                    : promo.type === 'FIXED'
                    ? `$${Number(promo.value)} OFF`
                    : promo.type === 'BUY_X_GET_Y'
                    ? `Buy ${promo.minQuantity || 2} Get 1`
                    : `${Number(promo.value)}% OFF`}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
                {promo.description && (
                  <p className="text-gray-600 text-sm mb-3">{promo.description}</p>
                )}

                {(promo.type === 'FLASH_SALE' || promo.type === 'LIGHTNING_DEAL') && (
                  <div className="mb-3">
                    <CountdownTimer endDate={promo.endDate} />
                  </div>
                )}

                {promo.type === 'LIGHTNING_DEAL' && promo.maxClaims && (
                  <div className="mb-3">
                    <LightningDealBar claimed={promo.currentClaims} max={promo.maxClaims} />
                  </div>
                )}

                {promo.minQuantity && promo.type !== 'BUY_X_GET_Y' && (
                  <p className="text-xs text-gray-500">Min. quantity: {promo.minQuantity}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-600">
                    {promo.type === 'FIXED' ? `$${Number(promo.value)} OFF` : `${Number(promo.value)}% OFF`}
                  </span>
                  {promo.maxClaims && (
                    <span className="text-xs text-gray-500">
                      {promo.maxClaims - promo.currentClaims} left
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupons Section */}
      <CouponsSection />
    </div>
  );
}

function CouponsSection() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [clipping, setClipping] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/coupons/available')
      .then(r => r.ok ? r.json() : { coupons: [] })
      .then(data => setCoupons(data.coupons || []))
      .catch(() => {});
  }, []);

  const clipCoupon = async (couponId: string) => {
    setClipping(couponId);
    try {
      const res = await fetch('/api/user-coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId }),
      });
      if (res.ok) {
        setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, clipped: true } : c));
      }
    } catch {} finally {
      setClipping(null);
    }
  };

  if (coupons.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">🎟️ Available Coupons</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon: any) => (
          <div key={coupon.id} className="border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg text-orange-700">
                  {coupon.type === 'PERCENTAGE' ? `${Number(coupon.value)}% OFF` : `$${Number(coupon.value)} OFF`}
                </p>
                <p className="text-sm text-gray-600">Code: {coupon.code}</p>
                {coupon.minOrderAmount && (
                  <p className="text-xs text-gray-500">Min. order: ${Number(coupon.minOrderAmount)}</p>
                )}
                {coupon.categoryId && (
                  <p className="text-xs text-gray-500">Category specific</p>
                )}
              </div>
              <button
                onClick={() => clipCoupon(coupon.id)}
                disabled={coupon.clipped || clipping === coupon.id}
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  coupon.clipped
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amazon-orange text-white hover:bg-orange-600'
                } disabled:opacity-70`}
              >
                {coupon.clipped ? '✓ Clipped' : clipping === coupon.id ? '...' : 'Clip Coupon'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
