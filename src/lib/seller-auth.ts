import prisma from '@/lib/prisma';
import { getServerSession, errorResponse } from '@/lib/api-helpers';
import { NextResponse } from 'next/server';

export async function requireSeller() {
  const session = await getServerSession();
  if (!session?.user) return { error: errorResponse('Unauthorized', 401) };

  const userId = (session.user as { id: string }).id;
  const seller = await prisma.seller.findUnique({ where: { userId } });
  if (!seller) return { error: errorResponse('Not a seller', 403) };
  if (seller.status === 'SUSPENDED') return { error: errorResponse('Seller account is suspended', 403) };

  return { seller, userId };
}

export async function requireAPIKey(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return { error: NextResponse.json({ error: 'API key required' }, { status: 401 }) };

  const key = await prisma.sellerAPIKey.findUnique({
    where: { key: apiKey },
    include: { seller: true },
  });
  if (!key || !key.isActive) return { error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }) };
  if (key.seller.status === 'SUSPENDED') return { error: NextResponse.json({ error: 'Seller suspended' }, { status: 403 }) };

  await prisma.sellerAPIKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });

  return { key, seller: key.seller };
}
