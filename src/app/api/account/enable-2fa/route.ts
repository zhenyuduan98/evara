import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generateSecret, generateURI } from 'otplib';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const secret = generateSecret();
    const otpauthUri = generateURI({
      strategy: 'totp',
      secret,
      label: user.email!,
      issuer: 'Evara',
    });

    await prisma.twoFactorSecret.upsert({
      where: { userId: user.id },
      update: { secret, enabled: false },
      create: { userId: user.id, secret, enabled: false },
    });

    return NextResponse.json({ secret, otpauthUri });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
