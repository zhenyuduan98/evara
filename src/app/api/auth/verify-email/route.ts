import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const verifyToken = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!verifyToken || verifyToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: verifyToken.userId },
      data: { emailVerified: new Date() },
    });

    await prisma.emailVerificationToken.delete({ where: { id: verifyToken.id } });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
