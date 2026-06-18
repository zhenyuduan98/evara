import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    const userId = (session.user as { id: string }).id;

    const links = await prisma.affiliateLink.findMany({
      where: { userId },
      include: { product: { select: { title: true, slug: true, price: true, images: { take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });

    const totals = await prisma.affiliateLink.aggregate({
      where: { userId },
      _sum: { clicks: true, conversions: true, earnings: true },
    });

    return successResponse({
      links,
      totals: {
        clicks: totals._sum.clicks || 0,
        conversions: totals._sum.conversions || 0,
        earnings: totals._sum.earnings || 0,
      },
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
