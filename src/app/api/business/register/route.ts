import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyName, taxId, industry } = await request.json();
    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const existing = await prisma.businessAccount.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: 'Business account already exists' }, { status: 409 });
    }

    const account = await prisma.businessAccount.create({
      data: {
        userId: session.user.id,
        companyName,
        taxId: taxId || null,
        industry: industry || null,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Business register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
