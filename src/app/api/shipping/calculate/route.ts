import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    if (state) {
      const zone = await prisma.shippingZone.findFirst({
        where: { states: { has: state } },
        include: { rates: true },
      });
      if (!zone) return successResponse({ rates: [] });
      return successResponse({ zone: zone.name, rates: zone.rates });
    }

    const zones = await prisma.shippingZone.findMany({ include: { rates: true } });
    return successResponse({ zones });
  } catch (error) {
    console.error('Shipping calc error:', error);
    return errorResponse('Failed to calculate shipping', 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return errorResponse('Unauthorized', 401);

    const { state, weight, method } = await request.json();
    if (!state || weight === undefined) return errorResponse('State and weight required');

    const zone = await prisma.shippingZone.findFirst({
      where: { states: { has: state } },
      include: { rates: true },
    });

    if (!zone) {
      return successResponse({ cost: 9.99, method: method || 'STANDARD', note: 'Default rate (no zone match)' });
    }

    const matchingRates = zone.rates.filter(
      (r) => Number(r.minWeight) <= weight && Number(r.maxWeight) >= weight && (!method || r.method === method)
    );

    if (matchingRates.length === 0) {
      return successResponse({ cost: 9.99, method: method || 'STANDARD', note: 'Default rate (no rate match)' });
    }

    const cheapest = matchingRates.sort((a, b) => Number(a.cost) - Number(b.cost))[0];
    return successResponse({ cost: Number(cheapest.cost), method: cheapest.method, zoneId: zone.id });
  } catch (error) {
    console.error('Shipping calc error:', error);
    return errorResponse('Failed to calculate shipping', 500);
  }
}
