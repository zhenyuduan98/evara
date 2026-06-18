import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import type { Metadata } from 'next';
import DealOfTheDay from '@/components/home/DealOfTheDay';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import ContentBlockRenderer from '@/components/cms/ContentBlockRenderer';
import { WebSiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';
import { TrendingSection, PersonalSection, BuyAgainSection } from '@/components/home/HomepageRecommendations';

export const metadata: Metadata = {
  title: 'Evara - Shop Everything',
  description: 'Shop millions of products at great prices. Fast delivery, easy returns, and secure checkout.',
  openGraph: {
    title: 'Evara - Shop Everything',
    description: 'Shop millions of products at great prices. Fast delivery, easy returns, and secure checkout.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evara - Shop Everything',
    description: 'Shop millions of products at great prices.',
  },
  alternates: { canonical: '/' },
};

const categories = [
  { name: 'Electronics', image: '🖥️', color: 'bg-blue-50' },
  { name: 'Books', image: '📚', color: 'bg-yellow-50' },
  { name: 'Clothing', image: '👕', color: 'bg-pink-50' },
  { name: 'Home & Kitchen', image: '🏠', color: 'bg-green-50' },
  { name: 'Toys & Games', image: '🎮', color: 'bg-purple-50' },
  { name: 'Sports', image: '⚽', color: 'bg-orange-50' },
  { name: 'Beauty', image: '💄', color: 'bg-rose-50' },
  { name: 'Automotive', image: '🚗', color: 'bg-slate-50' },
];

async function getContentBlocks() {
  try {
    return await prisma.contentBlock.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const blocks = await getContentBlocks();
  const useCMS = blocks.length > 0;

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (useCMS) {
    return (
      <div className="bg-gray-200 min-h-screen">
        <WebSiteJsonLd baseUrl={baseUrl} />
        <OrganizationJsonLd baseUrl={baseUrl} />
        {blocks.map((block) => (
          <ContentBlockRenderer key={block.id} block={block} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen">
      <WebSiteJsonLd baseUrl={baseUrl} />
      <OrganizationJsonLd baseUrl={baseUrl} />

      <div className="max-w-screen-xl mx-auto px-4 py-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name} href="#" className="bg-white p-5 rounded-sm shadow hover:shadow-md transition-shadow no-underline">
              <h2 className="text-lg font-bold text-amazon-dark mb-3">{cat.name}</h2>
              <div className={`${cat.color} rounded-md h-36 flex items-center justify-center text-6xl`}>{cat.image}</div>
              <p className="text-amazon-blue text-sm mt-3 hover:text-amazon-orange hover:underline">Shop now</p>
            </Link>
          ))}
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 mt-8"><DealOfTheDay /></div>
      <div className="max-w-screen-xl mx-auto px-4 mt-8"><FeaturedProducts /></div>
      <div className="max-w-screen-xl mx-auto px-4 mt-8"><TrendingSection /></div>
      <div className="max-w-screen-xl mx-auto px-4 mt-8"><PersonalSection /></div>
      <div className="max-w-screen-xl mx-auto px-4 mt-8"><BuyAgainSection /></div>
      <div className="max-w-screen-xl mx-auto px-4 mt-8"><RecentlyViewed /></div>
      <div className="h-8" />
    </div>
  );
}
