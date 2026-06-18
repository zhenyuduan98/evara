interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand: string;
  price: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  inStock?: boolean;
}

export default function ProductJsonLd({
  name, description, image, sku, brand, price,
  currency = 'USD', rating, reviewCount, url, inStock = true,
}: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    brand: { '@type': 'Brand', name: brand },
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
    },
    ...(rating && reviewCount ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        reviewCount,
      },
    } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
