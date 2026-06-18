import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.businessAccount.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!account) {
      return NextResponse.json({ error: 'No business account found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Business account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
