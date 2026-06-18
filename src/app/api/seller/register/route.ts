import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);

    const userId = (session.user as { id: string }).id;
    const existing = await prisma.seller.findUnique({ where: { userId } });
    if (existing) return errorResponse('Already registered as seller');

    const body = await request.json();
    const { companyName, description, logo } = body;
    if (!companyName) return errorResponse('Company name is required');

    const seller = await prisma.seller.create({
      data: { userId, companyName, description: description || null, logo: logo || null },
    });

    await prisma.user.update({ where: { id: userId }, data: { role: 'SELLER' } });

    return successResponse({ seller }, 201);
  } catch (error) {
    console.error('Seller register error:', error);
    return errorResponse('Registration failed', 500);
  }
}
