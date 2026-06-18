import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const url = req.nextUrl.searchParams.get('url') || '/';

  // Record click - mark notification as read
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  } catch (_) {
    // OK if not found
  }

  return NextResponse.redirect(new URL(url, req.url));
}
