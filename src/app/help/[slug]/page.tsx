import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.helpArticle.findUnique({
    where: { slug: params.slug, publishedAt: { not: null } },
    select: { title: true, body: true },
  });
  if (!article) return { title: 'Help Article Not Found' };
  const desc = article.body?.slice(0, 160) || article.title;
  return {
    title: article.title,
    description: desc,
    openGraph: { title: article.title, description: desc },
    twitter: { card: 'summary', title: article.title, description: desc },
    alternates: { canonical: `/help/${params.slug}` },
  };
}

export default async function HelpArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.helpArticle.findUnique({
    where: { slug: params.slug, publishedAt: { not: null } },
  });

  if (!article) notFound();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/help" className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Back to Help Center</Link>
      <div className="mb-4">
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{article.category}</span>
      </div>
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-sm text-gray-400 mb-6">Updated {new Date(article.updatedAt).toLocaleDateString()}</p>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, '<br/>') }} />
      {article.tags.length > 0 && (
        <div className="mt-8 pt-4 border-t flex gap-2">
          {article.tags.map(t => <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded">#{t}</span>)}
        </div>
      )}
    </div>
  );
}
