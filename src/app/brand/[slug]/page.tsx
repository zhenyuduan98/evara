'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  averageRating: number;
  images: { url: string }[];
}

export default function BrandPage() {
  const params = useParams();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/brands/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        setBrand(data.brand);
        setProducts(data.products || []);
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!brand) return <div className="p-8 text-center">Brand not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        {brand.logoUrl && <Image src={brand.logoUrl} alt={brand.name} className="w-16 h-16 object-contain"  width={64} height={64} />}
        <div>
          <h1 className="text-3xl font-bold">{brand.name}</h1>
          {brand.description && <p className="text-gray-600 mt-1">{brand.description}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="border rounded-lg p-4 hover:shadow-lg transition">
            {p.images?.[0] && <Image src={p.images[0].url} alt={p.title} className="w-full h-48 object-contain mb-3"  fill sizes="(max-width: 768px) 100vw, 50vw" />}
            <h3 className="font-medium text-sm line-clamp-2">{p.title}</h3>
            <p className="text-lg font-bold mt-2">${Number(p.price).toFixed(2)}</p>
            <p className="text-sm text-yellow-600">{'⭐'.repeat(Math.round(p.averageRating))}</p>
          </Link>
        ))}
        {products.length === 0 && <p className="col-span-full text-center text-gray-500">No products found for this brand.</p>}
      </div>
    </div>
  );
}
