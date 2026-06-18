import prisma from '@/lib/prisma';
import { successResponse } from '@/lib/api-helpers';
import { cacheWrap } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const deals = await cacheWrap('deals:active', 60, async () => {
    const now = new Date();
    return prisma.deal.findMany({
      where: { startDate: { lte: now }, endDate: { gte: now } },
      include: {
        product: {
          include: { images: { take: 1, orderBy: { position: 'asc' } } },
        },
      },
      orderBy: { featured: 'desc' },
    });
  });
  return successResponse(deals);
}
