import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSeller } from '@/lib/seller-auth';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSeller();
    if ('error' in auth && !('seller' in auth)) return auth.error;
    const { seller } = auth as { seller: { id: string } };

    const { documentType, documentUrl } = await request.json();
    if (!documentType || !documentUrl) return errorResponse('documentType and documentUrl required');
    if (!['ID', 'BUSINESS_LICENSE', 'TAX_CERT'].includes(documentType)) return errorResponse('Invalid document type');

    const kyc = await prisma.sellerKYC.create({
      data: { sellerId: seller.id, documentType, documentUrl },
    });
    return successResponse({ kyc }, 201);
  } catch (error) {
    console.error('KYC upload error:', error);
    return errorResponse('KYC upload failed', 500);
  }
}

export async function GET() {
  try {
    const auth = await requireSeller();
    if ('error' in auth && !('seller' in auth)) return auth.error;
    const { seller } = auth as { seller: { id: string; kycVerified: boolean } };

    const documents = await prisma.sellerKYC.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse({ kycVerified: seller.kycVerified, documents });
  } catch (error) {
    console.error('KYC status error:', error);
    return errorResponse('Failed to get KYC status', 500);
  }
}
