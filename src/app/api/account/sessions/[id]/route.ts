import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const activity = await prisma.loginActivity.findFirst({
      where: { id: params.id, userId },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await prisma.loginActivity.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Session revoked' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
