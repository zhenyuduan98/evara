import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const campaigns = await prisma.sponsoredProduct.findMany({
      where: { sellerId: userId },
      include: { product: { select: { id: true, title: true, price: true, images: { take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.isActive).length,
      totalImpressions: campaigns.reduce((s, c) => s + c.impressions, 0),
      totalClicks: campaigns.reduce((s, c) => s + c.clicks, 0),
      totalSpend: campaigns.reduce((s, c) => s + Number(c.bid) * c.clicks, 0),
    };

    return successResponse({ campaigns, summary });
  } catch (error) {
    console.error('Campaigns error:', error);
    return errorResponse('Failed to fetch campaigns', 500);
  }
}
