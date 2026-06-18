import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatPrice, calculateSavings } from '@/lib/format';
import Rating from '@/components/ui/Rating';
import ImageGallery from '@/components/products/ImageGallery';
import AddToCartSection from '@/components/products/AddToCartSection';
import PriceHistoryChart from '@/components/products/PriceHistoryChart';
import Recommendations from '@/components/products/Recommendations';
import QASection from '@/components/products/QASection';
import ViewTracker from '@/components/products/ViewTracker';
import InstallmentCalculator from '@/components/products/InstallmentCalculator';
import RecommendationSection from '@/components/RecommendationSection';
import SubscribeOption from '@/components/products/SubscribeOption';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true, images: { take: 1, orderBy: { position: 'asc' } }, price: true, brand: true },
  });
  if (!product) return { title: 'Product Not Found' };
  const imageUrl = product.images[0]?.url;
  return {
    title: `${product.title} - Evara`,
    description: product.description || `Buy ${product.title} from ${product.brand}`,
    openGraph: {
      title: product.title,
      description: product.description || `Buy ${product.title}`,
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description || undefined,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    alternates: { canonical: `/products/${params.slug}` },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: true,
      categories: { include: { parent: true } },
      seller: { select: { name: true } },
      attributes: { orderBy: { key: 'asc' } },
    },
  });

  if (!product) notFound();

  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const savings = compareAtPrice ? calculateSavings(price, compareAtPrice) : null;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  // Fetch bulk discounts
  const bulkDiscounts = await prisma.bulkDiscount.findMany({
    where: { productId: product.id },
    orderBy: { minQuantity: 'asc' },
  });

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || '',
    brand: { '@type': 'Brand', name: product.brand },
    image: product.images.map(img => img.url),
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: 'USD',
      availability: totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    } : undefined,
  };

  // Build breadcrumb from first category
  const category = product.categories[0];
  const breadcrumbs = [];
  if (category) {
    if (category.parent) {
      breadcrumbs.push({ name: category.parent.name, slug: category.parent.slug });
    }
    breadcrumbs.push({ name: category.name, slug: category.slug });
  }

  // Parse bullet points - stored as string array
  const bulletPoints: string[] = product.bulletPoints || [];

  // Use product attributes as specs
  const specs: { key: string; value: string }[] = product.attributes.map(a => ({ key: a.key, value: a.value }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 dark:bg-gray-900 dark:text-gray-100">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-amazon-orange">All Products</Link>
        {breadcrumbs.map((bc) => (
          <span key={bc.slug} className="flex items-center gap-1">
            <span>›</span>
            <Link href={`/products?category=${bc.slug}`} className="hover:text-amazon-orange">
              {bc.name}
            </Link>
          </span>
        ))}
        <span>›</span>
        <span className="text-gray-800 dark:text-gray-200 truncate">{product.title}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Gallery */}
        <div className="w-full md:w-2/5">
          <ImageGallery images={product.images.map(img => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            position: img.position,
          }))} />
          {product.videoUrl && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Video</h3>
              <video
                controls
                className="w-full rounded-lg"
                src={product.videoUrl}
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">{product.title}</h1>

          <p className="text-sm text-gray-500 mb-2">
            Brand: <Link href={`/products?brands=${encodeURIComponent(product.brand)}`} className="text-amazon-blue hover:text-amazon-orange hover:underline">{product.brand}</Link>
          </p>

          <div className="flex items-center gap-2 mb-3">
            <Rating value={product.averageRating} size="md" />
            <Link href="#reviews" className="text-sm text-amazon-blue hover:text-amazon-orange">
              {product.reviewCount.toLocaleString()} ratings
            </Link>
          </div>

          <hr className="mb-3" />

          {/* Price */}
          <div className="mb-4">
            {compareAtPrice && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <span>List Price:</span>
                <span className="line-through">{formatPrice(compareAtPrice)}</span>
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-3xl font-medium text-red-700">{formatPrice(price)}</span>
            </div>
            {savings && (
              <p className="text-sm text-red-600 mt-1">
                You Save: {savings.amount} ({savings.percent}%)
              </p>
            )}
            {price >= 50 && (
              <p className="text-sm text-blue-600 mt-1">
                💳 From <span className="font-semibold">${Math.ceil((price / 3) * 100 / 100).toFixed(2)}/mo</span> with installments
              </p>
            )}
          </div>

          <hr className="mb-4" />

          {/* Bulk Pricing Tiers */}
          {bulkDiscounts.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">📦 Business Bulk Pricing</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-blue-700">
                    <th className="pb-1">Quantity</th>
                    <th className="pb-1">Discount</th>
                    <th className="pb-1">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkDiscounts.map((d) => (
                    <tr key={d.id}>
                      <td>{d.minQuantity}+ units</td>
                      <td>{Number(d.discountPercent)}% off</td>
                      <td>{formatPrice(price * (1 - Number(d.discountPercent) / 100))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stock Warning */}
          {totalStock > 0 && totalStock < 10 && (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded mb-4 text-sm font-medium">
              ⚠️ Only {totalStock} left in stock - order soon!
            </div>
          )}
          {totalStock === 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm font-medium">
              Currently out of stock
            </div>
          )}

          {/* Add to Cart Section */}
          <div className="max-w-xs">
            <AddToCartSection
              productId={product.id}
              variants={product.variants.map(v => ({
                id: v.id,
                name: v.name,
                sku: v.sku,
                price: v.price ? Number(v.price) : null,
                stock: v.stock,
                options: v.options as Record<string, string>,
              }))}
              defaultStock={totalStock}
              basePrice={price}
            />
            <InstallmentCalculator price={price} />
            <SubscribeOption productId={product.id} price={price} />
          </div>
        </div>
      </div>

      {/* Below: Description, Bullet Points, Specs */}
      <div className="mt-12 border-t pt-8 space-y-8">
        {bulletPoints.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-3">About this item</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {bulletPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {product.description && (
          <div>
            <h2 className="text-xl font-bold mb-3">Product Description</h2>
            <div className="text-gray-700 whitespace-pre-line">{product.description}</div>
          </div>
        )}

        {/* Price History Chart */}
        <PriceHistoryChart productId={product.id} />

        {specs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-3">Technical Details</h2>
            <table className="w-full max-w-lg text-sm">
              <tbody>
                {specs.map((spec, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 font-medium text-gray-600 w-1/3">{spec.key}</td>
                    <td className="py-2 px-4">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}\n      </div>

      {/* View Tracker */}
      <ViewTracker product={{ id: product.id, title: product.title, slug: product.slug, price: String(price), image: product.images[0]?.url }} />

      {/* Recommendations */}
      <div className="mt-8 border-t pt-8" data-product-price={price}>
        <Recommendations productId={product.id} />
      </div>

      {/* Collaborative Filtering Recommendations */}
      <div className="mt-8 border-t pt-8">
        <RecommendationSection
          title="Customers who bought this also bought"
          fetchUrl={`/api/recommendations/similar/${product.id}`}
        />
      </div>

      {/* Q&A Section */}
      <div className="mt-8 border-t pt-8">
        <QASection productId={product.id} />
      </div>
    </div>
  );
}
