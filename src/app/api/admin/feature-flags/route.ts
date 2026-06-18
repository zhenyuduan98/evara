import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  return NextResponse.json(flags);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const flag = await prisma.featureFlag.create({
    data: { key: body.key, enabled: body.enabled ?? false, description: body.description, metadata: body.metadata },
  });
  return NextResponse.json(flag, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const flag = await prisma.featureFlag.update({
    where: { key: body.key },
    data: { enabled: body.enabled, description: body.description, metadata: body.metadata },
  });
  return NextResponse.json(flag);
}

export async function DELETE(req: NextRequest) {
  const { key } = await req.json();
  await prisma.featureFlag.delete({ where: { key } });
  return NextResponse.json({ success: true });
}
