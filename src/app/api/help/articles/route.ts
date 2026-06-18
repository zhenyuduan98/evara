import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId');
  const categorySlug = req.nextUrl.searchParams.get('category');
  const search = req.nextUrl.searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;
  if (categorySlug) where.category = categorySlug;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const articles = await prisma.helpArticle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, body: articleBody, category, categoryId, tags, publishedAt } = body;

    const article = await prisma.helpArticle.create({
      data: { title, slug, body: articleBody, category, categoryId, tags: tags || [], publishedAt },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
