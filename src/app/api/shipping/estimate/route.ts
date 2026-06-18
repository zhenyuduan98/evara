import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zipTo = searchParams.get('zipTo') || '90001';
  const method = searchParams.get('method') || 'standard';

  const baseDay = new Date();
  let minDays = 5;
  let maxDays = 7;

  switch (method) {
    case 'express':
      minDays = 1;
      maxDays = 2;
      break;
    case 'priority':
      minDays = 2;
      maxDays = 3;
      break;
    case 'standard':
    default:
      minDays = 5;
      maxDays = 7;
      break;
  }

  // Adjust for remote areas (high zip codes)
  const zipNum = parseInt(zipTo);
  if (zipNum > 80000) {
    minDays += 1;
    maxDays += 1;
  }

  const estimatedMin = new Date(baseDay.getTime() + minDays * 24 * 60 * 60 * 1000);
  const estimatedMax = new Date(baseDay.getTime() + maxDays * 24 * 60 * 60 * 1000);

  return NextResponse.json({
    method,
    zipTo,
    estimatedDelivery: {
      min: estimatedMin.toISOString().split('T')[0],
      max: estimatedMax.toISOString().split('T')[0],
      businessDays: `${minDays}-${maxDays}`,
    },
  });
}
