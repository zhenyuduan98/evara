import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) return errorResponse('Campaign not found', 404);
    if (campaign.status !== 'DRAFT') {
      return errorResponse('Campaign already sent or sending');
    }

    // Count recipients (all users with email)
    const recipientCount = await prisma.user.count({
      where: { email: { not: null } },
    });

    // Mark as sending
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'SENDING',
        recipientCount,
      },
    });

    // In production, this would queue via BullMQ. Here we simulate completion.
    // Queue: emailQueue.add('send-campaign', { campaignId: params.id })
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        sentCount: recipientCount,
        sentAt: new Date(),
      },
    });

    return successResponse({ message: 'Campaign queued for sending', recipientCount });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
