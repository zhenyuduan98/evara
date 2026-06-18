import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/deals`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
    { url: `${BASE_URL}/gift-cards`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Products
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
  });
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Categories
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  });
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/products?category=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Brands
  const brands = await prisma.brand.findMany({
    select: { slug: true, createdAt: true },
  });
  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE_URL}/brand/${b.slug}`,
    lastModified: b.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Help articles
  const articles = await prisma.helpArticle.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true, updatedAt: true },
  });
  const helpPages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/help/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }));

  // Campaigns
  const campaigns = await prisma.campaign.findMany({
    where: { isActive: true },
    select: { slug: true, createdAt: true },
  });
  const campaignPages: MetadataRoute.Sitemap = campaigns.map((c) => ({
    url: `${BASE_URL}/campaign/${c.slug}`,
    lastModified: c.createdAt,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...brandPages,
    ...helpPages,
    ...campaignPages,
  ];
}
