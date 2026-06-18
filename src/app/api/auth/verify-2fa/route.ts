import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { TOTP } from 'otplib';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const totp = new TOTP();

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const userId = token.id as string;
    const twoFactor = await prisma.twoFactorSecret.findUnique({ where: { userId } });
    if (!twoFactor || !twoFactor.enabled) {
      return NextResponse.json({ error: '2FA not enabled' }, { status: 400 });
    }

    // Try TOTP code first
    const isValidTotp = totp.verify({ token: code, secret: twoFactor.secret });
    if (isValidTotp) {
      return NextResponse.json({ verified: true });
    }

    // Try recovery code
    const recoveryCodes = await prisma.recoveryCode.findMany({
      where: { userId, usedAt: null },
    });

    for (const rc of recoveryCodes) {
      const isMatch = await bcrypt.compare(code.toUpperCase(), rc.code);
      if (isMatch) {
        await prisma.recoveryCode.update({
          where: { id: rc.id },
          data: { usedAt: new Date() },
        });
        return NextResponse.json({ verified: true, recoveryCodeUsed: true });
      }
    }

    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
