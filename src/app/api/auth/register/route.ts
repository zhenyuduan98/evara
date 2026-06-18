import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema, passwordStrengthCheck, getPasswordStrengthLabel } from '@/lib/validations';
import { verifyCaptcha } from '@/lib/captcha';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // CAPTCHA verification
    if (body.captchaToken && body.captchaAnswer !== undefined) {
      if (!verifyCaptcha(Number(body.captchaAnswer), body.captchaToken)) {
        return NextResponse.json({ error: 'Invalid CAPTCHA answer' }, { status: 400 });
      }
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const strength = passwordStrengthCheck(password);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.errors[0] }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, passwordStrength: getPasswordStrengthLabel(password) },
    });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
