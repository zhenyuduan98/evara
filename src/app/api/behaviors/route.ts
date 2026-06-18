import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, action } = await request.json();

    if (!productId || !['VIEW', 'CART', 'PURCHASE', 'WISHLIST'].includes(action)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await prisma.userBehavior.create({
      data: {
        userId: session.user.id,
        productId,
        action,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track behavior error:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
