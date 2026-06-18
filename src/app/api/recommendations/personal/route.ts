import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPersonalRecommendations } from '@/lib/recommendations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }
    const products = await getPersonalRecommendations(session.user.id);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Personal recommendations error:', error);
    return NextResponse.json([]);
  }
}
