'use client';

import { useState, useEffect } from 'react';

interface UserCouponData {
  id: string;
  claimedAt: string;
  usedAt: string | null;
  coupon: {
    id: string;
    code: string;
    type: string;
    value: string;
    minOrderAmount: string | null;
    expiresAt: string | null;
    categoryId: string | null;
  };
}

export default function CouponWalletPage() {
  const [coupons, setCoupons] = useState<UserCouponData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user-coupons')
      .then(r => r.ok ? r.json() : { userCoupons: [] })
      .then(data => setCoupons(data.userCoupons || []))
      .finally(() => setLoading(false));
  }, []);

  const unused = coupons.filter(c => !c.usedAt);
  const used = coupons.filter(c => c.usedAt);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🎟️ My Coupons</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-lg" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No coupons yet</p>
          <p className="text-sm mt-2">
            Visit <a href="/deals" className="text-blue-600 underline">Deals</a> to clip coupons
          </p>
        </div>
      ) : (
        <>
          {unused.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 text-green-700">Available ({unused.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unused.map(uc => (
                  <CouponCard key={uc.id} uc={uc} />
                ))}
              </div>
            </div>
          )}

          {used.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-500">Used ({used.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                {used.map(uc => (
                  <CouponCard key={uc.id} uc={uc} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CouponCard({ uc }: { uc: UserCouponData }) {
  const c = uc.coupon;
  const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();

  return (
    <div className={`border-2 border-dashed rounded-lg p-4 ${
      uc.usedAt ? 'border-gray-300 bg-gray-50' : isExpired ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-xl">
            {c.type === 'PERCENTAGE' ? `${Number(c.value)}% OFF` : `$${Number(c.value)} OFF`}
          </p>
          <p className="text-sm font-mono text-gray-600 mt-1">{c.code}</p>
          {c.minOrderAmount && (
            <p className="text-xs text-gray-500 mt-1">Min. order: ${Number(c.minOrderAmount)}</p>
          )}
          {c.categoryId && <p className="text-xs text-gray-500">Category specific</p>}
          {c.expiresAt && (
            <p className="text-xs text-gray-500 mt-1">
              Expires: {new Date(c.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="text-right">
          {uc.usedAt ? (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Used</span>
          ) : isExpired ? (
            <span className="text-xs bg-red-200 text-red-600 px-2 py-1 rounded">Expired</span>
          ) : (
            <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded">Active</span>
          )}
        </div>
      </div>
    </div>
  );
}
