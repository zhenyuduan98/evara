import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const link = await prisma.affiliateLink.findUnique({
      where: { code: params.code },
      include: {
        product: { select: { title: true, price: true, slug: true } },
        affiliateClicks: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            ip: true,
            createdAt: true,
            convertedAt: true,
            orderId: true,
          },
        },
      },
    });

    if (!link) return errorResponse('Affiliate link not found', 404);

    const totalClicks = await prisma.affiliateClick.count({
      where: { affiliateLinkId: link.id },
    });

    const conversions = await prisma.affiliateClick.count({
      where: { affiliateLinkId: link.id, convertedAt: { not: null } },
    });

    return successResponse({
      link: {
        code: link.code,
        product: link.product,
        clicks: link.clicks,
        conversions: link.conversions,
        earnings: link.earnings,
      },
      detailedStats: {
        totalClicks,
        conversions,
        conversionRate: totalClicks > 0 ? (conversions / totalClicks * 100).toFixed(2) : '0',
      },
      recentClicks: link.affiliateClicks,
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
