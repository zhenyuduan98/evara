'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  averageRating: number;
  reviewCount: number;
  description?: string;
  images: { url: string; alt?: string }[];
  attributes: { key: string; value: string }[];
}

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids')?.split(',') || [];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => fetch(`/api/products/${id}`).then((r) => r.json())))
      .then((results) => setProducts(results.filter((r: Product) => r.id)))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (products.length === 0) return <div className="p-8 text-center">No products to compare. Add ?ids=1,2,3 to the URL.</div>;

  const allKeys = [...new Set(products.flatMap((p) => p.attributes?.map((a) => a.key) || []))];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Compare Products</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 bg-gray-50 text-left w-40">Feature</th>
              {products.map((p) => (
                <th key={p.id} className="border p-3 bg-gray-50 text-center min-w-[200px]">
                  {p.images?.[0] && <Image src={p.images[0].url} alt={p.title} className="w-24 h-24 object-contain mx-auto mb-2"  width={96} height={96} />}
                  <div className="font-semibold text-sm">{p.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-3 font-medium bg-gray-50">Price</td>
              {products.map((p) => <td key={p.id} className="border p-3 text-center font-bold text-lg">${Number(p.price).toFixed(2)}</td>)}
            </tr>
            <tr>
              <td className="border p-3 font-medium bg-gray-50">Brand</td>
              {products.map((p) => <td key={p.id} className="border p-3 text-center">{p.brand}</td>)}
            </tr>
            <tr>
              <td className="border p-3 font-medium bg-gray-50">Rating</td>
              {products.map((p) => <td key={p.id} className="border p-3 text-center">{'⭐'.repeat(Math.round(p.averageRating))} ({p.reviewCount})</td>)}
            </tr>
            {allKeys.map((key) => (
              <tr key={key}>
                <td className="border p-3 font-medium bg-gray-50 capitalize">{key}</td>
                {products.map((p) => (
                  <td key={p.id} className="border p-3 text-center">
                    {p.attributes?.find((a) => a.key === key)?.value || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
