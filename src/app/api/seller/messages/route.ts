import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const messages = await prisma.sellerMessage.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.sellerMessage.count({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    });

    return successResponse({ messages, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Messages error:', error);
    return errorResponse('Failed to fetch messages', 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const body = await request.json();
    const { receiverId, content, orderId } = body;
    if (!receiverId || !content) return errorResponse('receiverId and content required', 400);

    const message = await prisma.sellerMessage.create({
      data: {
        senderId: userId,
        receiverId,
        sellerId: seller.id,
        orderId: orderId || null,
        content,
      },
    });

    return successResponse(message, 201);
  } catch (error) {
    console.error('Send message error:', error);
    return errorResponse('Failed to send message', 500);
  }
}
