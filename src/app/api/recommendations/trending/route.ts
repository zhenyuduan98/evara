import { NextRequest, NextResponse } from 'next/server';
import { getTrending } from '@/lib/recommendations';
import { cacheWrap } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const days = Number(request.nextUrl.searchParams.get('days')) || 7;
    const products = await cacheWrap(`recommendations:trending:${days}`, 300, () => getTrending(days));
    return NextResponse.json(products);
  } catch (error) {
    console.error('Trending error:', error);
    return NextResponse.json([]);
  }
}
