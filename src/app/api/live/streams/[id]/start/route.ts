import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stream = await prisma.liveStream.update({
      where: { id: params.id },
      data: { status: 'LIVE', startedAt: new Date() },
    });
    return NextResponse.json(stream);
  } catch (error) {
    console.error('Error starting stream:', error);
    return NextResponse.json({ error: 'Failed to start stream' }, { status: 500 });
  }
}
