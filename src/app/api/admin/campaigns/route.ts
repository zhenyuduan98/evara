import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, slugify, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const campaigns = await prisma.campaign.findMany({
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
    const { title, description, bannerImage, featuredProductIds, startDate, endDate, isActive } = body;

    if (!title || !description || !startDate || !endDate) {
      return errorResponse('Missing required fields: title, description, startDate, endDate');
    }

    const slug = slugify(title) + '-' + Date.now().toString(36);

    const campaign = await prisma.campaign.create({
      data: {
        title,
        slug,
        description,
        bannerImage: bannerImage || null,
        featuredProductIds: featuredProductIds || [],
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
      },
    });

    return successResponse(campaign, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
