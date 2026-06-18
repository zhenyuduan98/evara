import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const existing = await prisma.platformAnnouncement.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });

  const announcement = await prisma.platformAnnouncement.update({
    where: { id: params.id },
    data: body,
  });

  await logAdminAction((session.user as any).id, 'UPDATE_ANNOUNCEMENT', 'PlatformAnnouncement', body, { targetId: params.id });

  return NextResponse.json(announcement);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.platformAnnouncement.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });

  await prisma.platformAnnouncement.delete({ where: { id: params.id } });
  await logAdminAction((session.user as any).id, 'DELETE_ANNOUNCEMENT', 'PlatformAnnouncement', {}, { targetId: params.id });

  return NextResponse.json({ success: true });
}
