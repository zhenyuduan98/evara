import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const where: any = { publishedAt: { not: null } };
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  const articles = await prisma.helpArticle.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, slug: true, category: true, tags: true, publishedAt: true },
  });

  const categories = await prisma.helpArticle.groupBy({
    by: ['category'],
    where: { publishedAt: { not: null } },
    _count: true,
  });

  return NextResponse.json({ articles, categories });
}
