import { NextResponse } from 'next/server';
import { syncProductsToMeilisearch } from '@/lib/meilisearch';

export async function POST() {
  try {
    const result = await syncProductsToMeilisearch();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Meilisearch sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync products to Meilisearch' },
      { status: 500 }
    );
  }
}
