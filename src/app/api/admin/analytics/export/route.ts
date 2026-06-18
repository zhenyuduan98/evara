import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      include: { items: true, user: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['Order Number', 'Date', 'Customer', 'Email', 'Status', 'Subtotal', 'Shipping', 'Tax', 'Total', 'Items'];
    const rows = orders.map(o => [
      o.orderNumber,
      o.createdAt.toISOString().split('T')[0],
      o.user.name || '',
      o.user.email || '',
      o.status,
      Number(o.subtotal).toFixed(2),
      Number(o.shippingCost).toFixed(2),
      Number(o.tax).toFixed(2),
      Number(o.total).toFixed(2),
      o.items.map(i => `${i.title} x${i.quantity}`).join('; '),
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-export-${days}d.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
