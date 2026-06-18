import prisma from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) return errorResponse('Not a seller', 403);

    const text = await request.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return errorResponse('CSV must have header + at least 1 row', 400);

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const titleIdx = headers.indexOf('title');
    const descIdx = headers.indexOf('description');
    const brandIdx = headers.indexOf('brand');
    const priceIdx = headers.indexOf('price');
    const skuIdx = headers.indexOf('sku');
    const bulletIdx = headers.indexOf('bulletpoints');

    if (titleIdx < 0 || priceIdx < 0 || skuIdx < 0 || brandIdx < 0) {
      return errorResponse('Missing required columns: title, brand, price, sku', 400);
    }

    let success = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      try {
        const title = vals[titleIdx];
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '-' + Date.now() + '-' + i;
        await prisma.product.create({
          data: {
            title,
            slug,
            description: descIdx >= 0 ? vals[descIdx] : '',
            brand: vals[brandIdx],
            price: parseFloat(vals[priceIdx]),
            sku: vals[skuIdx],
            bulletPoints: bulletIdx >= 0 && vals[bulletIdx] ? vals[bulletIdx].split('|') : [],
            sellerId: userId,
            sellerProfileId: seller.id,
            status: 'DRAFT',
          },
        });
        success++;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        errors.push(`Row ${i}: ${msg}`);
      }
    }

    return successResponse({ success, errors });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return errorResponse('Failed to process CSV', 500);
  }
}
