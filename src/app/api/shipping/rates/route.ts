import { NextRequest, NextResponse } from 'next/server';
import { getCarrierRates } from '@/lib/carriers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const weight = parseFloat(searchParams.get('weight') || '1');
  const originZip = searchParams.get('originZip') || '10001';
  const destinationZip = searchParams.get('destinationZip') || '90001';

  const rates = await getCarrierRates(
    weight,
    { zip: originZip },
    { zip: destinationZip }
  );

  return NextResponse.json({ rates });
}
