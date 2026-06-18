import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check admin
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { assignedTo, slaDeadline } = await req.json();

  try {
    const existing = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    const ticket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        ...(assignedTo !== undefined && { assignedTo }),
        ...(slaDeadline && { slaDeadline: new Date(slaDeadline) }),
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Assign ticket error:', error);
    return NextResponse.json({ error: 'Failed to assign ticket' }, { status: 500 });
  }
}
