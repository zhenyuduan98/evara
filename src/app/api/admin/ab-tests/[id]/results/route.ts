import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const experiment = await prisma.experiment.findUnique({
      where: { id: params.id },
      include: { assignments: true },
    });

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    }

    const variants = experiment.variants as { name: string; weight: number }[];
    
    // Group assignments by variant
    const variantStats: Record<string, { assigned: number; converted: number }> = {};
    for (const v of variants) {
      variantStats[v.name] = { assigned: 0, converted: 0 };
    }

    for (const assignment of experiment.assignments) {
      if (!variantStats[assignment.variant]) {
        variantStats[assignment.variant] = { assigned: 0, converted: 0 };
      }
      variantStats[assignment.variant].assigned++;
      
      // Check if user converted (has an order after assignment)
      const hasOrder = await prisma.order.findFirst({
        where: {
          userId: assignment.userId,
          createdAt: { gte: assignment.createdAt },
          status: { not: 'CANCELLED' },
        },
      });
      if (hasOrder) {
        variantStats[assignment.variant].converted++;
      }
    }

    // Calculate conversion rates and confidence
    const results = Object.entries(variantStats).map(([variant, stats]) => {
      const conversionRate = stats.assigned > 0 ? stats.converted / stats.assigned : 0;
      return {
        variant,
        assigned: stats.assigned,
        converted: stats.converted,
        conversionRate: Math.round(conversionRate * 10000) / 100,
      };
    });

    // Basic z-test confidence between first two variants
    let confidence: number | null = null;
    if (results.length >= 2) {
      const a = results[0];
      const b = results[1];
      if (a.assigned > 0 && b.assigned > 0) {
        const pA = a.converted / a.assigned;
        const pB = b.converted / b.assigned;
        const pPool = (a.converted + b.converted) / (a.assigned + b.assigned);
        const se = Math.sqrt(pPool * (1 - pPool) * (1 / a.assigned + 1 / b.assigned));
        if (se > 0) {
          const z = Math.abs(pA - pB) / se;
          // Approximate p-value from z-score using normal CDF approximation
          const p = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
          confidence = Math.round((1 - 2 * p) * 10000) / 100;
        }
      }
    }

    return NextResponse.json({
      experiment: {
        id: experiment.id,
        name: experiment.name,
        status: experiment.status,
      },
      results,
      confidence,
      totalAssignments: experiment.assignments.length,
    });
  } catch (error) {
    console.error('AB test results error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
