import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await getServerSession();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  const userId = (session.user as { id: string }).id;

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId },
    include: { items: { include: { product: true } } },
  });

  if (!order) return errorResponse('Order not found', 404);

  const item = order.items.find((i: { id: string }) => i.id === params.itemId);
  if (!item) return errorResponse('Item not found', 404);
  if (!(item.product as { isDigital: boolean }).isDigital) {
    return errorResponse('Not a digital product', 400);
  }

  const delivery = await prisma.digitalDelivery.findUnique({
    where: { orderItemId: params.itemId },
  });

  if (!delivery) return errorResponse('No digital delivery found', 404);

  if (delivery.downloadCount >= delivery.maxDownloads) {
    return errorResponse('Download limit reached', 403);
  }

  if (delivery.expiresAt && new Date() > delivery.expiresAt) {
    return errorResponse('Download link expired', 403);
  }

  await prisma.digitalDelivery.update({
    where: { id: delivery.id },
    data: { downloadCount: { increment: 1 } },
  });

  // Generate a signed URL (in production, use S3 presigned URLs)
  const signedUrl = `${delivery.downloadUrl}?token=${Buffer.from(`${delivery.id}:${Date.now()}`).toString('base64')}`;

  return successResponse({ downloadUrl: signedUrl });
}
