export function WebSiteJsonLd({ baseUrl }: { baseUrl: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Evara',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/products?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function OrganizationJsonLd({ baseUrl }: { baseUrl: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Evara',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ProductJsonLd({
  name, description, image, price, currency, sku, brand, url, ratingValue, reviewCount, availability,
}: {
  name: string; description: string; image?: string; price: number; currency?: string;
  sku: string; brand?: string; url: string; ratingValue?: number; reviewCount?: number;
  availability?: 'InStock' | 'OutOfStock';
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    sku,
    ...(image ? { image } : {}),
    ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: currency || 'USD',
      availability: `https://schema.org/${availability || 'InStock'}`,
      url,
    },
    ...(ratingValue && reviewCount ? {
      aggregateRating: { '@type': 'AggregateRating', ratingValue, reviewCount, bestRating: 5 },
    } : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function CollectionPageJsonLd({ name, description, url }: { name: string; description: string; url: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
