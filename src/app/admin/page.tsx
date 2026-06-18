import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/format';

export default async function AdminDashboard() {
  const session = await requireAdmin();
  if (!session) redirect('/auth/signin');

  const [totalOrders, totalUsers, totalProducts, revenueResult, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const revenue = Number(revenueResult._sum.total || 0);

  const stats = [
    { label: 'Total Orders', value: totalOrders.toLocaleString(), color: 'bg-blue-500' },
    { label: 'Revenue', value: formatPrice(revenue), color: 'bg-green-500' },
    { label: 'Users', value: totalUsers.toLocaleString(), color: 'bg-purple-500' },
    { label: 'Products', value: totalProducts.toLocaleString(), color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow p-6">
            <div className={`w-10 h-10 ${s.color} rounded-lg mb-3`} />
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Revenue Chart</h2>
        <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
          📈 Chart placeholder — integrate Recharts or Chart.js
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-500">
            <th className="pb-2">Order</th><th className="pb-2">Customer</th>
            <th className="pb-2">Status</th><th className="pb-2">Total</th><th className="pb-2">Date</th>
          </tr></thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="py-2 font-mono text-xs">{o.orderNumber.slice(0, 12)}...</td>
                <td className="py-2">{o.user.name || o.user.email}</td>
                <td className="py-2"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{o.status}</span></td>
                <td className="py-2">{formatPrice(Number(o.total))}</td>
                <td className="py-2 text-gray-500">{o.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
