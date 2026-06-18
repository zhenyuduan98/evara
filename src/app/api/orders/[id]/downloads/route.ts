import { prisma } from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  const userId = (session.user as { id: string }).id;

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId },
  });

  if (!order) return errorResponse('Order not found', 404);

  const items = await prisma.digitalDelivery.findMany({
    where: { orderId: params.id },
    include: { orderItem: { select: { title: true, imageUrl: true } } },
  });

  return successResponse({ items });
}
