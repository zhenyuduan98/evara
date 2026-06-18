import { prisma } from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const credits = await prisma.storeCredit.findMany({
      where: {
        userId: user.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    const balance = credits.reduce((sum, c) => sum + Number(c.amount), 0);

    return successResponse({ balance: Math.round(balance * 100) / 100, credits });
  } catch (error) {
    console.error('Store credit error:', error);
    return errorResponse('Internal server error', 500);
  }
}
