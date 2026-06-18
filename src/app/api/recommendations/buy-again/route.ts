import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBuyAgain } from '@/lib/recommendations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }
    const products = await getBuyAgain(session.user.id);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Buy again error:', error);
    return NextResponse.json([]);
  }
}
