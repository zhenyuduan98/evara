import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const methods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ paymentMethods: methods });
  } catch (error) {
    console.error('Payment methods error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const { type, last4, brand, isDefault, stripePaymentMethodId } = await req.json();
    if (!type || !last4) return errorResponse('Type and last4 are required');

    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const method = await prisma.paymentMethod.create({
      data: { userId: user.id, type, last4, brand, isDefault: isDefault || false, stripePaymentMethodId },
    });

    return successResponse({ paymentMethod: method }, 201);
  } catch (error) {
    console.error('Payment method create error:', error);
    return errorResponse('Internal server error', 500);
  }
}
