import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiError } from '@/lib/rate-limit';

export async function GET() {
  try {
    const blocks = await prisma.contentBlock.findMany({ orderBy: { position: 'asc' } });
    return NextResponse.json(blocks);
  } catch {
    return NextResponse.json(apiError('Failed to fetch content blocks', 'FETCH_ERROR', 500), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED', 401), { status: 401 });
    }
    const body = await req.json();
    const maxPos = await prisma.contentBlock.aggregate({ _max: { position: true } });
    const block = await prisma.contentBlock.create({
      data: {
        type: body.type,
        title: body.title || null,
        config: body.config || {},
        position: (maxPos._max.position ?? -1) + 1,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(block);
  } catch {
    return NextResponse.json(apiError('Failed to create block', 'CREATE_ERROR', 500), { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED', 401), { status: 401 });
    }
    const body = await req.json();
    if (body.reorder && Array.isArray(body.items)) {
      for (const item of body.items) {
        await prisma.contentBlock.update({ where: { id: item.id }, data: { position: item.position } });
      }
      return NextResponse.json({ success: true });
    }
    const block = await prisma.contentBlock.update({
      where: { id: body.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.config !== undefined && { config: body.config }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.type !== undefined && { type: body.type }),
      },
    });
    return NextResponse.json(block);
  } catch {
    return NextResponse.json(apiError('Failed to update block', 'UPDATE_ERROR', 500), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED', 401), { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json(apiError('Missing id', 'MISSING_ID', 400), { status: 400 });
    await prisma.contentBlock.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(apiError('Failed to delete block', 'DELETE_ERROR', 500), { status: 500 });
  }
}
