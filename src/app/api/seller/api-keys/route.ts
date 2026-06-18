import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSeller } from '@/lib/seller-auth';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import crypto from 'crypto';

export async function GET() {
  try {
    const auth = await requireSeller();
    if ('error' in auth && !('seller' in auth)) return auth.error;
    const { seller } = auth as { seller: { id: string } };

    const keys = await prisma.sellerAPIKey.findMany({
      where: { sellerId: seller.id },
      select: { id: true, name: true, key: true, permissions: true, lastUsedAt: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    // Mask keys
    const masked = keys.map(k => ({ ...k, key: k.key.slice(0, 8) + '...' + k.key.slice(-4) }));
    return successResponse({ keys: masked });
  } catch (error) {
    console.error('API keys list error:', error);
    return errorResponse('Failed to list API keys', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSeller();
    if ('error' in auth && !('seller' in auth)) return auth.error;
    const { seller } = auth as { seller: { id: string } };

    const { name, permissions } = await request.json();
    if (!name) return errorResponse('name is required');

    const key = `sk_${crypto.randomBytes(32).toString('hex')}`;
    const apiKey = await prisma.sellerAPIKey.create({
      data: { sellerId: seller.id, key, name, permissions: permissions || {} },
    });
    return successResponse({ apiKey: { ...apiKey, key } }, 201); // Return full key only on creation
  } catch (error) {
    console.error('API key create error:', error);
    return errorResponse('Failed to create API key', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireSeller();
    if ('error' in auth && !('seller' in auth)) return auth.error;
    const { seller } = auth as { seller: { id: string } };

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    if (!keyId) return errorResponse('id is required');

    await prisma.sellerAPIKey.updateMany({
      where: { id: keyId, sellerId: seller.id },
      data: { isActive: false },
    });
    return successResponse({ success: true });
  } catch (error) {
    console.error('API key revoke error:', error);
    return errorResponse('Failed to revoke API key', 500);
  }
}
