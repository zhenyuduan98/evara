import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check admin
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel');
  const locale = searchParams.get('locale');

  const where = {
    ...(channel ? { channel: channel as 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' } : {}),
    ...(locale ? { locale } : {}),
  };

  const templates = await prisma.notificationTemplate.findMany({ where, orderBy: { name: 'asc' } });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, channel, subject, body, variables, locale } = await req.json();

  if (!name || !channel || !body) {
    return NextResponse.json({ error: 'name, channel, body required' }, { status: 400 });
  }

  const template = await prisma.notificationTemplate.create({
    data: { name, channel, subject, body, variables, locale: locale || 'en' },
  });

  return NextResponse.json({ template }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, name, channel, subject, body, variables, locale } = await req.json();

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const template = await prisma.notificationTemplate.update({
    where: { id },
    data: { ...(name && { name }), ...(channel && { channel }), subject, body, variables, ...(locale && { locale }) },
  });

  return NextResponse.json({ template });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.notificationTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
