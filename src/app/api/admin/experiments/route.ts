import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const experiments = await prisma.experiment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { assignments: true } } },
  });
  return NextResponse.json({ experiments });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, variants, trafficPercent, status } = body;

    if (!name || !description || !variants) {
      return NextResponse.json({ error: 'name, description, and variants are required' }, { status: 400 });
    }

    const experiment = await prisma.experiment.create({
      data: {
        name,
        description,
        variants,
        trafficPercent: trafficPercent || 100,
        status: status || 'ACTIVE',
      },
    });

    return NextResponse.json({ experiment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Experiment name must be unique' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create experiment' }, { status: 500 });
  }
}
