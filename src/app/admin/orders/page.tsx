import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/format';

const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const;

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await requireAdmin();
  if (!session) redirect('/auth/signin');

  const statusFilter = searchParams.status && searchParams.status !== 'ALL' ? searchParams.status as 'PENDING' : undefined;

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter as 'PENDING' } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map((s) => (
          <a key={s} href={`/admin/orders?status=${s}`}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              (searchParams.status || 'ALL') === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{s}</a>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b text-left text-gray-500">
            <th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3">Date</th><th className="p-3">Update</th>
          </tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{o.orderNumber.slice(0, 12)}</td>
                <td className="p-3">{o.user.name || o.user.email}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{o.status}</span></td>
                <td className="p-3">{formatPrice(Number(o.total))}</td>
                <td className="p-3 text-gray-500">{o.createdAt.toLocaleDateString()}</td>
                <td className="p-3">
                  <form action={`/api/admin/orders/${o.id}`} method="POST" className="flex gap-1">
                    <select name="status" defaultValue={o.status} className="text-xs border rounded px-1 py-0.5">
                      {statuses.filter(s => s !== 'ALL').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
