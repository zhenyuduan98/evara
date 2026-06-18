import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await prisma.businessAccount.findUnique({
      where: { id: params.id },
    });
    if (!account) {
      return NextResponse.json({ error: 'Business account not found' }, { status: 404 });
    }

    const updated = await prisma.businessAccount.update({
      where: { id: params.id },
      data: { isVerified: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Verify business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
