import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const campaign = await prisma.campaign.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true, bannerImage: true },
  });
  if (!campaign) return { title: 'Campaign Not Found' };
  return {
    title: campaign.title,
    description: campaign.description || `${campaign.title} - Special Campaign`,
    openGraph: {
      title: campaign.title,
      description: campaign.description || undefined,
      ...(campaign.bannerImage ? { images: [{ url: campaign.bannerImage }] } : {}),
    },
    twitter: { card: 'summary_large_image', title: campaign.title },
    alternates: { canonical: `/campaign/${params.slug}` },
  };
}

export default async function CampaignPage({ params }: { params: { slug: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { slug: params.slug },
  });

  if (!campaign || !campaign.isActive) return notFound();

  const now = new Date();
  if (now < campaign.startDate || now > campaign.endDate) return notFound();

  const products = campaign.featuredProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: campaign.featuredProductIds } },
        include: { images: { take: 1 } },
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <div className="relative h-[250px] md:h-[350px] bg-gradient-to-r from-amazon-yellow to-amazon-orange flex items-center justify-center">
        {campaign.bannerImage ? (
          <Image src={campaign.bannerImage} alt={campaign.title} className="w-full h-full object-cover absolute inset-0"  fill sizes="(max-width: 768px) 100vw, 50vw" />
        ) : null}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">{campaign.title}</h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow">{campaign.description}</p>
          <p className="text-sm text-white/70 mt-2">
            Ends {campaign.endDate.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products featured in this campaign yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="bg-white rounded shadow p-4 hover:shadow-md transition no-underline">
                <div className="h-40 flex items-center justify-center mb-3">
                  {product.images[0] ? (
                    <Image src={product.images[0].url} alt={product.title} className="max-h-full object-contain"  fill sizes="(max-width: 768px) 100vw, 50vw" />
                  ) : (
                    <div className="text-gray-300 text-4xl">📦</div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-amazon-dark line-clamp-2">{product.title}</h3>
                <p className="text-lg font-bold text-amazon-dark mt-1">${Number(product.price).toFixed(2)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
