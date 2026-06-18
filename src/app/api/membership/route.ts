import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ membership: null }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  const membership = await prisma.membership.findUnique({ where: { userId } });

  return NextResponse.json({ membership: membership || { tier: 'FREE', expiresAt: null, benefits: null } });
}
