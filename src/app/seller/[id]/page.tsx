import Image from 'next/image';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const seller = await prisma.seller.findUnique({
    where: { id: params.id },
    select: { companyName: true, description: true, logo: true },
  });
  if (!seller) return { title: 'Seller Not Found' };
  return {
    title: seller.companyName,
    description: seller.description || `Shop products from ${seller.companyName}`,
    openGraph: {
      title: seller.companyName,
      description: seller.description || `Shop products from ${seller.companyName}`,
      ...(seller.logo ? { images: [{ url: seller.logo }] } : {}),
    },
    twitter: { card: 'summary', title: seller.companyName },
    alternates: { canonical: `/seller/${params.id}` },
  };
}

async function getSellerData(sellerId: string, page: number, sort: string) {
  const seller = await prisma.seller.findUnique({
    where: { id: sellerId },
    include: {
      user: { select: { name: true, image: true } },
    },
  });
  if (!seller) return null;

  const pageSize = 12;
  const orderBy: Record<string, string> = sort === 'price_asc' ? { price: 'asc' } : sort === 'price_desc' ? { price: 'desc' } : sort === 'rating' ? { averageRating: 'desc' } : { createdAt: 'desc' };

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where: { sellerProfileId: sellerId, status: 'ACTIVE' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      include: { images: { take: 1 } },
    }),
    prisma.product.count({ where: { sellerProfileId: sellerId, status: 'ACTIVE' } }),
  ]);

  const reviews = await prisma.sellerReview.findMany({ where: { sellerId } });
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const totalSold = await prisma.orderItem.count({
    where: { product: { sellerProfileId: sellerId } },
  });

  return { seller, products, totalProducts, totalPages: Math.ceil(totalProducts / pageSize), reviews, avgRating, totalSold, reviewCount: reviews.length };
}

export default async function SellerProfilePage({ params, searchParams }: { params: { id: string }; searchParams: { page?: string; sort?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const sort = searchParams.sort || 'newest';
  const data = await getSellerData(params.id, page, sort);
  if (!data) return notFound();

  const { seller, products, totalProducts, totalPages, reviews, avgRating, totalSold, reviewCount } = data;

  const ratingDistribution = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: reviews.filter(rv => rv.rating === r).length,
    pct: reviews.length ? (reviews.filter(rv => rv.rating === r).length / reviews.length) * 100 : 0,
  }));

  const performanceScore = Math.min(100, Math.round(
    (avgRating / 5) * 40 + Math.min(reviewCount, 50) / 50 * 30 + Math.min(totalSold, 100) / 100 * 30
  ));

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-lg p-8 mb-6 text-white relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shrink-0 relative">
            {seller.logo ? <Image src={seller.logo} alt={seller.companyName} className="rounded-full object-cover" fill sizes="96px" /> : <span>🏪</span>}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{seller.companyName}</h1>
            <p className="text-blue-200 mt-1">{seller.description || 'Welcome to our store'}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-yellow-300">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
              <span className="text-sm">{avgRating.toFixed(1)} ({reviewCount} reviews)</span>
              <span className="text-sm">|</span>
              <span className="text-sm">{totalProducts} products</span>
              <span className="text-sm">|</span>
              <span className="text-sm">{totalSold} sold</span>
            </div>
          </div>
          <div className="text-center bg-white/10 rounded-lg p-4">
            <p className="text-4xl font-bold">{performanceScore}</p>
            <p className="text-xs text-blue-200">Performance Score</p>
          </div>
        </div>
      </div>

      {/* About & Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3">About Us</h2>
          <p className="text-gray-600">{seller.description || 'This seller has not provided a description yet.'}</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Member since {new Date(seller.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3">Store Policies</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div><strong>Shipping:</strong> Orders processed within 1-2 business days</div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div><strong>Returns:</strong> 30-day return policy on most items</div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div><strong>Support:</strong> Customer service available Mon-Fri</div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div><strong>Quality:</strong> All products inspected before shipping</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">Rating Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, pct }) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="w-12 text-sm">{stars} star</span>
                <div className="flex-1 bg-gray-200 h-4 rounded">
                  <div className="bg-yellow-400 h-4 rounded" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-sm text-right">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-yellow-500">{avgRating.toFixed(1)}</p>
            <p className="text-gray-500 mt-1">out of 5</p>
            <p className="text-sm text-gray-400">{reviewCount} total ratings</p>
          </div>
        </div>
      </div>

      {/* Products with sorting and pagination */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Products ({totalProducts})</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Sort by:</label>
            <div className="flex gap-2">
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price ↑' },
                { value: 'price_desc', label: 'Price ↓' },
                { value: 'rating', label: 'Top Rated' },
              ].map(s => (
                <a key={s.value} href={`/seller/${params.id}?page=1&sort=${s.value}`} className={`px-2 py-1 rounded text-xs border ${sort === s.value ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => (
            <a key={p.id} href={`/product/${p.slug}`} className="border rounded-lg p-3 hover:shadow-md transition">
              <div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center relative">
                {p.images[0] ? <Image src={p.images[0].url} alt={p.title} className="object-contain" fill sizes="(max-width: 768px) 50vw, 25vw" /> : <span>📦</span>}
              </div>
              <p className="text-sm font-medium line-clamp-2">{p.title}</p>
              <p className="text-amazon-orange font-bold">${Number(p.price).toFixed(2)}</p>
              {p.averageRating > 0 && <p className="text-xs text-gray-500">{'★'.repeat(Math.round(p.averageRating))} ({p.reviewCount})</p>}
            </a>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {page > 1 && <a href={`/seller/${params.id}?page=${page - 1}&sort=${sort}`} className="px-3 py-1 border rounded hover:bg-gray-50">← Prev</a>}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <a key={p} href={`/seller/${params.id}?page=${p}&sort=${sort}`} className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>{p}</a>
            ))}
            {page < totalPages && <a href={`/seller/${params.id}?page=${page + 1}&sort=${sort}`} className="px-3 py-1 border rounded hover:bg-gray-50">Next →</a>}
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white border rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-lg font-bold mb-4">Recent Reviews</h2>
          <div className="space-y-3">
            {reviews.slice(0, 10).map(r => (
              <div key={r.id} className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
