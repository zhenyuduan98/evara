import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAPIKey } from '@/lib/seller-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAPIKey(request);
  if ('error' in auth && !('seller' in auth)) return auth.error;
  const { seller, key } = auth as { seller: { id: string }; key: { permissions: unknown } };

  const perms = key.permissions as Record<string, boolean>;
  if (!perms['products:read'] && !perms['*']) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    where: { sellerProfileId: seller.id },
    take: 50,
  });
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const auth = await requireAPIKey(request);
  if ('error' in auth && !('seller' in auth)) return auth.error;
  const { seller, key } = auth as { seller: { id: string }; key: { permissions: unknown } };

  const perms = key.permissions as Record<string, boolean>;
  if (!perms['orders:read'] && !perms['*']) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === 'list_orders') {
    // Placeholder: would need seller-specific order query
    return NextResponse.json({ orders: [], message: 'External API v1' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
