import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';
import { redirect } from 'next/navigation';

export default async function AdminCouponsPage() {
  const session = await requireAdmin();
  if (!session) redirect('/auth/signin');

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Coupons</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Create Coupon</h2>
        <form action="/api/admin/coupons" method="POST" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input name="code" placeholder="CODE" required className="border rounded px-3 py-2 uppercase" />
          <select name="type" className="border rounded px-3 py-2">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
          </select>
          <input name="value" type="number" step="0.01" placeholder="Value" required className="border rounded px-3 py-2" />
          <input name="maxUses" type="number" placeholder="Max uses (optional)" className="border rounded px-3 py-2" />
          <input name="minOrderAmount" type="number" step="0.01" placeholder="Min order (optional)" className="border rounded px-3 py-2" />
          <input name="expiresAt" type="date" className="border rounded px-3 py-2" />
          <button className="bg-gray-900 text-white px-4 py-2 rounded col-span-2">Create</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b text-left text-gray-500">
            <th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Value</th><th className="p-3">Uses</th><th className="p-3">Active</th><th className="p-3">Expires</th>
          </tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono font-bold">{c.code}</td>
                <td className="p-3">{c.type}</td>
                <td className="p-3">{c.type === 'PERCENTAGE' ? `${c.value}%` : `$${c.value}`}</td>
                <td className="p-3">{c.currentUses}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                <td className="p-3">{c.isActive ? '✅' : '❌'}</td>
                <td className="p-3 text-gray-500">{c.expiresAt?.toLocaleDateString() || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
