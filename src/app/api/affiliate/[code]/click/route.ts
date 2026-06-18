import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const link = await prisma.affiliateLink.findUnique({
      where: { code: params.code },
    });

    if (!link) return errorResponse('Affiliate link not found', 404);

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || null;

    await prisma.affiliateClick.create({
      data: {
        affiliateLinkId: link.id,
        ip,
        userAgent,
        referrer,
      },
    });

    // Increment click count on link
    await prisma.affiliateLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    return successResponse({ message: 'Click tracked', productId: link.productId });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
