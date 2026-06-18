import { NextRequest } from 'next/server';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

const INTEREST_RATES: Record<number, number> = {
  3: 0.0,    // 0% for 3 months
  6: 0.05,   // 5% for 6 months
  12: 0.10,  // 10% for 12 months
};

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  const amount = parseFloat(req.nextUrl.searchParams.get('amount') || '0');
  if (amount <= 0) return errorResponse('Invalid amount');

  const options = Object.entries(INTEREST_RATES).map(([months, rate]) => {
    const m = parseInt(months);
    const totalWithInterest = amount * (1 + rate);
    const monthlyAmount = Math.ceil(totalWithInterest / m * 100) / 100;
    return {
      months: m,
      interestRate: rate,
      totalAmount: Math.round(totalWithInterest * 100) / 100,
      monthlyAmount,
    };
  });

  return successResponse({ options });
}
