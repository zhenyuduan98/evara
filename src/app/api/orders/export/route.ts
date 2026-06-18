import { prisma } from '@/lib/prisma';
import { getServerSession, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  const userId = (session.user as { id: string }).id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const csvRows = ['Order Number,Date,Status,Item,Quantity,Price,Total'];
  for (const order of orders) {
    for (const item of order.items) {
      csvRows.push(
        `"${order.orderNumber}","${order.createdAt.toISOString()}","${order.status}","${item.title.replace(/"/g, '""')}",${item.quantity},${item.price},${order.total}`
      );
    }
  }

  return new Response(csvRows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="orders.csv"',
    },
  });
}
