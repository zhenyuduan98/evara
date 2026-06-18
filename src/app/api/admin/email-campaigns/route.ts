import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(campaigns);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const body = await request.json();
    const { name, subject, html, scheduledAt } = body;

    if (!name || !subject || !html) {
      return errorResponse('Missing required fields: name, subject, html');
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        subject,
        html,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return successResponse(campaign, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
