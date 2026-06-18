import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get('months') || '6');

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  // Get users with their signup month and order months
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: startDate } },
    select: {
      id: true,
      createdAt: true,
      orders: {
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  // Group by signup month cohort
  const cohorts: Record<string, {
    cohortMonth: string;
    totalUsers: number;
    retention: Record<number, number>; // month offset -> unique users who ordered
  }> = {};

  for (const user of users) {
    const signupMonth = user.createdAt.toISOString().slice(0, 7); // "2024-01"

    if (!cohorts[signupMonth]) {
      cohorts[signupMonth] = { cohortMonth: signupMonth, totalUsers: 0, retention: {} };
    }
    cohorts[signupMonth].totalUsers++;

    // Track which months (offsets) this user placed orders
    const orderMonths = new Set<number>();
    for (const order of user.orders) {
      const orderMonth = order.createdAt.toISOString().slice(0, 7);
      const signupDate = new Date(signupMonth + '-01');
      const orderDate = new Date(orderMonth + '-01');
      const offset = (orderDate.getFullYear() - signupDate.getFullYear()) * 12
        + (orderDate.getMonth() - signupDate.getMonth());
      if (offset >= 0) orderMonths.add(offset);
    }

    for (const offset of orderMonths) {
      cohorts[signupMonth].retention[offset] = (cohorts[signupMonth].retention[offset] || 0) + 1;
    }
  }

  // Convert to sorted array with retention percentages
  const result = Object.values(cohorts)
    .sort((a, b) => a.cohortMonth.localeCompare(b.cohortMonth))
    .map(c => ({
      cohortMonth: c.cohortMonth,
      totalUsers: c.totalUsers,
      retention: Object.fromEntries(
        Object.entries(c.retention).map(([offset, count]) => [
          offset,
          { users: count, percent: Math.round((count / c.totalUsers) * 100) },
        ])
      ),
    }));

  return NextResponse.json({ cohorts: result, months });
}
