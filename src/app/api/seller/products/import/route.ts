import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, slugify } from '@/lib/api-helpers';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] || ''));
    return row;
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);

    const user = session.user as { id: string; role?: string };
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
      return errorResponse('Forbidden', 403);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return errorResponse('CSV file is required');

    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length === 0) return errorResponse('Empty or invalid CSV');

    const requiredFields = ['title', 'price', 'brand', 'sku'];
    const created = [];
    const errors: { row: number; field?: string; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed + header

      // Validate required fields
      const missingFields = requiredFields.filter(f => !row[f]?.trim());
      if (missingFields.length > 0) {
        errors.push({ row: rowNum, field: missingFields.join(', '), error: `Missing required fields: ${missingFields.join(', ')}` });
        continue;
      }

      // Validate price is a positive number
      const price = parseFloat(row.price);
      if (isNaN(price) || price <= 0) {
        errors.push({ row: rowNum, field: 'price', error: `Invalid price: "${row.price}" - must be a positive number` });
        continue;
      }

      // Validate title length
      if (row.title.length > 500) {
        errors.push({ row: rowNum, field: 'title', error: 'Title exceeds 500 characters' });
        continue;
      }

      try {
        const product = await prisma.product.create({
          data: {
            title: row.title,
            slug: slugify(row.title) + '-' + Date.now() + '-' + i,
            description: row.description || '',
            brand: row.brand,
            price: price,
            sku: row.sku,
            sellerId: user.id,
            status: 'DRAFT',
            videoUrl: row.videoUrl || null,
          },
        });
        created.push(product.id);
      } catch (e) {
        errors.push({ row: i + 2, error: String(e) });
      }
    }

    return NextResponse.json({ success: true, created: created.length, errors }, { status: 201 });
  } catch (error) {
    console.error('CSV import error:', error);
    return errorResponse('Internal server error', 500);
  }
}
