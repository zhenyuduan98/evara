import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-helpers';

// Guest checkout is handled by /api/checkout with guestEmail + guestCartId params
// This endpoint is a convenience wrapper
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.guestEmail) {
      return errorResponse('guestEmail is required for guest checkout');
    }
    if (!body.guestCartId) {
      return errorResponse('guestCartId is required for guest checkout');
    }

    // Forward to main checkout
    const checkoutUrl = new URL('/api/checkout', req.url);
    const response = await fetch(checkoutUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return errorResponse(data.error || 'Checkout failed', response.status);
    }

    return successResponse(data);
  } catch (error) {
    console.error('Guest checkout error:', error);
    return errorResponse('Internal server error', 500);
  }
}
