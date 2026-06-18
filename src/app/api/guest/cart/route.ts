import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

function getSessionId(): string {
  const cookieStore = cookies();
  let sessionId = cookieStore.get('guest_session')?.value;
  if (!sessionId) {
    sessionId = uuidv4();
  }
  return sessionId;
}

function setSessionCookie(response: NextResponse, sessionId: string) {
  response.cookies.set('guest_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  return response;
}

interface GuestCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export async function GET() {
  try {
    const sessionId = getSessionId();
    const cart = await prisma.guestCart.findUnique({ where: { sessionId } });
    const items = (cart?.items as GuestCartItem[]) || [];
    const response = NextResponse.json({ items, cartId: cart?.id || null });
    return setSessionCookie(response, sessionId);
  } catch (error) {
    console.error('Guest cart GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = getSessionId();
    const { productId, variantId, quantity = 1 } = await req.json();
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    let cart = await prisma.guestCart.findUnique({ where: { sessionId } });
    const items: GuestCartItem[] = cart ? (cart.items as GuestCartItem[]) : [];

    const existing = items.findIndex(
      (i) => i.productId === productId && (i.variantId || null) === (variantId || null)
    );
    if (existing >= 0) {
      items[existing].quantity += quantity;
    } else {
      items.push({ productId, variantId: variantId || undefined, quantity });
    }

    if (cart) {
      cart = await prisma.guestCart.update({ where: { id: cart.id }, data: { items } });
    } else {
      cart = await prisma.guestCart.create({ data: { sessionId, items } });
    }

    const response = NextResponse.json({ items, cartId: cart.id });
    return setSessionCookie(response, sessionId);
  } catch (error) {
    console.error('Guest cart POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionId = getSessionId();
    const { productId, variantId, quantity } = await req.json();
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    const cart = await prisma.guestCart.findUnique({ where: { sessionId } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    let items = cart.items as GuestCartItem[];
    const idx = items.findIndex(
      (i) => i.productId === productId && (i.variantId || null) === (variantId || null)
    );
    if (idx < 0) return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });

    if (quantity <= 0) {
      items = items.filter((_, i) => i !== idx);
    } else {
      items[idx].quantity = quantity;
    }

    await prisma.guestCart.update({ where: { id: cart.id }, data: { items } });
    const response = NextResponse.json({ items, cartId: cart.id });
    return setSessionCookie(response, sessionId);
  } catch (error) {
    console.error('Guest cart PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = getSessionId();
    const { productId, variantId } = await req.json().catch(() => ({ productId: null, variantId: null }));

    const cart = await prisma.guestCart.findUnique({ where: { sessionId } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    if (productId) {
      const items = (cart.items as GuestCartItem[]).filter(
        (i) => !(i.productId === productId && (i.variantId || null) === (variantId || null))
      );
      await prisma.guestCart.update({ where: { id: cart.id }, data: { items } });
      const response = NextResponse.json({ items, cartId: cart.id });
      return setSessionCookie(response, sessionId);
    } else {
      await prisma.guestCart.delete({ where: { id: cart.id } });
      const response = NextResponse.json({ items: [], cartId: null });
      return setSessionCookie(response, sessionId);
    }
  } catch (error) {
    console.error('Guest cart DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
