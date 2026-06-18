import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { TOTP } from 'otplib';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const totp = new TOTP();

function generateRecoveryCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const twoFactor = await prisma.twoFactorSecret.findUnique({ where: { userId: user.id } });
    if (!twoFactor) {
      return NextResponse.json({ error: '2FA not set up' }, { status: 400 });
    }

    const isValid = totp.verify(code, twoFactor.secret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Enable 2FA
    await prisma.twoFactorSecret.update({
      where: { userId: user.id },
      data: { enabled: true },
    });

    // Generate recovery codes
    const plainCodes = generateRecoveryCodes(10);

    // Delete old recovery codes
    await prisma.recoveryCode.deleteMany({ where: { userId: user.id } });

    // Store hashed recovery codes
    for (const plainCode of plainCodes) {
      const hashedCode = await bcrypt.hash(plainCode, 10);
      await prisma.recoveryCode.create({
        data: { userId: user.id, code: hashedCode },
      });
    }

    return NextResponse.json({
      message: '2FA enabled successfully',
      recoveryCodes: plainCodes,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
