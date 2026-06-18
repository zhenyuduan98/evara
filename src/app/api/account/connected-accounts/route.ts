import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ accounts: [] });
  }

  const userId = (session.user as { id?: string }).id;
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { provider: true, providerAccountId: true },
  });

  return NextResponse.json({ accounts });
}
