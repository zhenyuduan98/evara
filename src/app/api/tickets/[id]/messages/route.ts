import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!isAdmin && ticket.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { body } = await req.json();

  const message = await prisma.ticketMessage.create({
    data: { ticketId: params.id, senderId: userId, body, isStaff: isAdmin },
  });

  if (isAdmin && ticket.status === 'OPEN') {
    await prisma.ticket.update({ where: { id: params.id }, data: { status: 'IN_PROGRESS' } });
  }

  return NextResponse.json(message);
}
