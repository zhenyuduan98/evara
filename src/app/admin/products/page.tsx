import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

export default async function AdminProductsPage() {
  const session = await requireAdmin();
  if (!session) redirect('/auth/signin');

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { seller: { select: { name: true } }, _count: { select: { orderItems: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b text-left text-gray-500">
            <th className="p-3">Title</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3">Seller</th><th className="p-3">Sales</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{formatPrice(Number(p.price))}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[p.status]}`}>{p.status}</span></td>
                <td className="p-3">{p.seller.name || '—'}</td>
                <td className="p-3">{p._count.orderItems}</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">Edit</Link>
                  <form action={`/api/admin/products/${p.id}`} method="POST">
                    <input type="hidden" name="status" value="ARCHIVED" />
                    <button className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded hover:bg-gray-100">Archive</button>
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
