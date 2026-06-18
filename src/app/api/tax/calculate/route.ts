import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const { country, state, amount } = await req.json();
    if (!country || amount === undefined) {
      return errorResponse('country and amount required');
    }

    // Look up tax rate from DB
    const where: Record<string, unknown> = { country: country.toUpperCase() };
    if (state) where.state = state.toUpperCase();

    const taxRate = await prisma.taxRate.findFirst({
      where: {
        country: country.toUpperCase(),
        ...(state ? { state: state.toUpperCase() } : {}),
      },
    });

    const rate = taxRate ? Number(taxRate.rate) : 0;
    const taxAmount = Math.round(amount * rate * 100) / 100;

    return successResponse({
      country,
      state: state || null,
      rate,
      subtotal: amount,
      taxAmount,
      total: Math.round((amount + taxAmount) * 100) / 100,
    });
  } catch (error) {
    console.error('Tax calc error:', error);
    return errorResponse('Internal server error', 500);
  }
}
