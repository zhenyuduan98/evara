import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const articles = await prisma.helpArticle.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title, slug, body, category, tags, published } = await req.json();

  const article = await prisma.helpArticle.create({
    data: {
      title, slug, body, category,
      tags: tags || [],
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json(article);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, title, slug, body, category, tags, published } = await req.json();

  const article = await prisma.helpArticle.update({
    where: { id },
    data: {
      title, slug, body, category,
      tags: tags || [],
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json(article);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await req.json();
  await prisma.helpArticle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
