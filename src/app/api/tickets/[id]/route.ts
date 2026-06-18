import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!isAdmin && ticket.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json(ticket);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!isAdmin && ticket.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = await req.json();
  const updateData: any = {};
  if (data.status && isAdmin) updateData.status = data.status;
  if (data.priority && isAdmin) updateData.priority = data.priority;
  if (data.status === 'CLOSED' && ticket.userId === userId) updateData.status = 'CLOSED';

  const updated = await prisma.ticket.update({ where: { id: params.id }, data: updateData });
  return NextResponse.json(updated);
}
