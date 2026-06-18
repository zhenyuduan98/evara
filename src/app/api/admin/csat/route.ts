import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get('period') || '30'; // days
  const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

  try {
    const feedbacks = await prisma.ticketFeedback.findMany({
      where: { createdAt: { gte: daysAgo } },
      include: { ticket: { select: { assignedTo: true, category: true, priority: true } } },
    });

    const totalFeedbacks = feedbacks.length;
    const avgScore = totalFeedbacks > 0
      ? feedbacks.reduce((sum, f) => sum + f.score, 0) / totalFeedbacks
      : 0;

    // Score distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((f) => {
      if (distribution[f.score] !== undefined) distribution[f.score]++;
    });

    // Agent performance
    const agentMap = new Map<string, { total: number; sum: number; count: number }>();
    feedbacks.forEach((f) => {
      const agent = f.ticket.assignedTo || 'unassigned';
      const existing = agentMap.get(agent) || { total: 0, sum: 0, count: 0 };
      existing.total++;
      existing.sum += f.score;
      existing.count++;
      agentMap.set(agent, existing);
    });

    const agentPerformance = Array.from(agentMap.entries()).map(([agentId, data]) => ({
      agentId,
      avgScore: data.sum / data.count,
      totalRatings: data.total,
    }));

    // Daily trend (last 30 days)
    const dailyTrend: { date: string; avgScore: number; count: number }[] = [];
    const dayMap = new Map<string, { sum: number; count: number }>();
    feedbacks.forEach((f) => {
      const day = f.createdAt.toISOString().split('T')[0];
      const existing = dayMap.get(day) || { sum: 0, count: 0 };
      existing.sum += f.score;
      existing.count++;
      dayMap.set(day, existing);
    });
    dayMap.forEach((data, date) => {
      dailyTrend.push({ date, avgScore: data.sum / data.count, count: data.count });
    });
    dailyTrend.sort((a, b) => a.date.localeCompare(b.date));

    // Category breakdown
    const catMap = new Map<string, { sum: number; count: number }>();
    feedbacks.forEach((f) => {
      const cat = f.ticket.category || 'unknown';
      const existing = catMap.get(cat) || { sum: 0, count: 0 };
      existing.sum += f.score;
      existing.count++;
      catMap.set(cat, existing);
    });
    const categoryBreakdown = Array.from(catMap.entries()).map(([category, data]) => ({
      category,
      avgScore: data.sum / data.count,
      count: data.count,
    }));

    return NextResponse.json({
      summary: {
        avgScore: Math.round(avgScore * 100) / 100,
        totalFeedbacks,
        distribution,
        satisfactionRate: totalFeedbacks > 0
          ? Math.round((feedbacks.filter((f) => f.score >= 4).length / totalFeedbacks) * 100)
          : 0,
      },
      agentPerformance,
      dailyTrend,
      categoryBreakdown,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CSAT data' }, { status: 500 });
  }
}
