import { prisma } from '@/lib/prisma';
import { requireAdmin, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return errorResponse('Unauthorized', 401);

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const csvRows = ['Order Number,Date,Status,Customer,Email,Item,Quantity,Price,Total'];
  for (const order of orders) {
    for (const item of order.items) {
      csvRows.push(
        `"${order.orderNumber}","${order.createdAt.toISOString()}","${order.status}","${(order.user.name || '').replace(/"/g, '""')}","${order.user.email}","${item.title.replace(/"/g, '""')}",${item.quantity},${item.price},${order.total}`
      );
    }
  }

  return new Response(csvRows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="all-orders.csv"',
    },
  });
}
