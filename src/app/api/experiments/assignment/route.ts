import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const experimentName = searchParams.get('experiment');
  const userId = searchParams.get('userId');

  if (!experimentName || !userId) {
    return NextResponse.json({ error: 'experiment and userId are required' }, { status: 400 });
  }

  const experiment = await prisma.experiment.findUnique({ where: { name: experimentName } });
  if (!experiment || experiment.status !== 'ACTIVE') {
    return NextResponse.json({ variant: null, experiment: null });
  }

  const existing = await prisma.experimentAssignment.findUnique({
    where: { experimentId_userId: { experimentId: experiment.id, userId } },
  });

  if (existing) {
    return NextResponse.json({ variant: existing.variant, experiment: experiment.name });
  }

  // Assign variant based on traffic percent
  const rand = Math.random() * 100;
  if (rand > experiment.trafficPercent) {
    return NextResponse.json({ variant: null, experiment: experiment.name });
  }

  const variants = experiment.variants as string[];
  const variant = variants[Math.floor(Math.random() * variants.length)];

  const assignment = await prisma.experimentAssignment.create({
    data: { experimentId: experiment.id, userId, variant },
  });

  return NextResponse.json({ variant: assignment.variant, experiment: experiment.name });
}
