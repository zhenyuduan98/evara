import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';
import { redirect } from 'next/navigation';

export default async function AdminSellersPage() {
  const session = await requireAdmin();
  if (!session) redirect('/auth/signin');

  const sellers = await prisma.user.findMany({
    where: { role: 'SELLER' },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sellers</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b text-left text-gray-500">
            <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Products</th><th className="p-3">Joined</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{s.name || '—'}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s._count.products}</td>
                <td className="p-3 text-gray-500">{s.createdAt.toLocaleDateString()}</td>
                <td className="p-3 flex gap-2">
                  <button className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100">Approve</button>
                  <button className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100">Reject</button>
                </td>
              </tr>
            ))}
            {sellers.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">No sellers found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
