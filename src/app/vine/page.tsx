'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface VineProduct {
  id: string;
  samplesAvailable: number;
  samplesClaimed: number;
  product: {
    id: string;
    title: string;
    price: string;
    images: { url: string; alt?: string }[];
  };
}

interface VineClaim {
  id: string;
  claimedAt: string;
  reviewId?: string;
  vineProduct: VineProduct;
}

export default function VinePage() {
  const [available, setAvailable] = useState<VineProduct[]>([]);
  const [claims, setClaims] = useState<VineClaim[]>([]);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/vine/available').then(r => r.ok ? r.json() : null),
      fetch('/api/vine/my-claims').then(r => r.ok ? r.json() : null),
    ]).then(([avail, myClaims]) => {
      if (avail) { setAvailable(avail); setIsMember(true); }
      else { setIsMember(false); }
      if (myClaims) setClaims(myClaims);
      setLoading(false);
    });
  }, []);

  const handleClaim = async (vineProductId: string) => {
    const res = await fetch(`/api/vine/claim/${vineProductId}`, { method: 'POST' });
    if (res.ok) {
      setAvailable(prev => prev.filter(p => p.id !== vineProductId));
      const claimsRes = await fetch('/api/vine/my-claims');
      if (claimsRes.ok) setClaims(await claimsRes.json());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Program Info */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">🌿 Evara Vine Program</h1>
        <p className="text-lg opacity-90 mb-4">
          Evara Vine invites the most trusted reviewers to post opinions about new products to help fellow customers make informed purchasing decisions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded p-4">
            <h3 className="font-semibold">🎁 Free Products</h3>
            <p className="text-sm opacity-80">Receive products at no cost in exchange for honest reviews</p>
          </div>
          <div className="bg-white/10 rounded p-4">
            <h3 className="font-semibold">⭐ Trusted Reviews</h3>
            <p className="text-sm opacity-80">Vine reviews are marked with a special badge</p>
          </div>
          <div className="bg-white/10 rounded p-4">
            <h3 className="font-semibold">📦 Early Access</h3>
            <p className="text-sm opacity-80">Get access to products before they&apos;re widely available</p>
          </div>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}

      {!loading && isMember === false && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">You&apos;re not a Vine member yet</h2>
          <p className="text-gray-600">Vine membership is by invitation only. Keep writing helpful reviews!</p>
        </div>
      )}

      {!loading && isMember && (
        <>
          {/* Available Products */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Available Products</h2>
            {available.length === 0 ? (
              <p className="text-gray-500">No products available right now. Check back later!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {available.map(vp => (
                  <div key={vp.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                    {vp.product.images[0] && (
                      <div className="relative w-full h-40 mb-3">
                        <Image
                          src={vp.product.images[0].url}
                          alt={vp.product.images[0].alt || vp.product.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{vp.product.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {vp.samplesAvailable - vp.samplesClaimed} samples remaining
                    </p>
                    <p className="text-sm text-green-700 font-bold mb-2">FREE (Vine)</p>
                    <button
                      onClick={() => handleClaim(vp.id)}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-sm font-medium py-2 rounded"
                    >
                      Claim Sample
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My Claims */}
          <section>
            <h2 className="text-2xl font-bold mb-4">My Claims</h2>
            {claims.length === 0 ? (
              <p className="text-gray-500">You haven&apos;t claimed any products yet.</p>
            ) : (
              <div className="space-y-3">
                {claims.map(claim => (
                  <div key={claim.id} className="flex items-center gap-4 border rounded-lg p-4">
                    {claim.vineProduct.product.images[0] && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={claim.vineProduct.product.images[0].url}
                          alt={claim.vineProduct.product.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{claim.vineProduct.product.title}</h3>
                      <p className="text-xs text-gray-500">
                        Claimed on {new Date(claim.claimedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {claim.reviewId ? (
                        <span className="text-green-600 text-sm font-medium">✓ Reviewed</span>
                      ) : (
                        <Link
                          href={`/products/${claim.vineProduct.product.id}`}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Write Review
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
