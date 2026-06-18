import { NextRequest, NextResponse } from 'next/server';
import { extractDominantColor, findSimilarByColor } from '@/lib/image-search';

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid or missing form data. Send multipart/form-data with an "image" field.' }, { status: 400 });
    }
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const color = extractDominantColor(buffer);
    const products = await findSimilarByColor(color);

    return NextResponse.json({
      dominantColor: color,
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price.toString(),
        image: p.images[0]?.url || null,
        similarityScore: p.similarityScore,
      })),
    });
  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json({ error: 'Image search failed' }, { status: 500 });
  }
}
