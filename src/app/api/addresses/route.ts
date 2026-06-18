import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  const { name, addressLine1, addressLine2, city, state, zipCode, country, phone, isDefault } = data;

  if (!name || !addressLine1 || !city || !state || !zipCode || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { userId, name, addressLine1, addressLine2, city, state, zipCode, country: country || 'US', phone, isDefault: isDefault || false },
  });

  return NextResponse.json({ address });
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  const { id, ...fields } = data;

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (fields.isDefault) {
    await prisma.address.updateMany({ where: { userId, NOT: { id } }, data: { isDefault: false } });
  }

  const updated = await prisma.address.update({ where: { id }, data: fields });
  return NextResponse.json({ address: updated });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
