import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { passwordStrengthCheck, getPasswordStrengthLabel } from '@/lib/validations';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { oldPassword, newPassword } = await req.json();

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: 'Both old and new passwords are required' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  const strength = passwordStrengthCheck(newPassword);
  if (!strength.valid) {
    return NextResponse.json({ error: strength.errors[0] }, { status: 400 });
  }

  const userId = (session.user as { id?: string }).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.password) {
    return NextResponse.json({ error: 'Cannot change password for OAuth-only accounts' }, { status: 400 });
  }

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, passwordStrength: getPasswordStrengthLabel(newPassword) },
  });

  return NextResponse.json({ message: 'Password changed successfully' });
}
