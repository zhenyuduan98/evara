import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';
import { redirect } from 'next/navigation';

const roleBadgeColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  SELLER: 'bg-blue-100 text-blue-800',
  USER: 'bg-gray-100 text-gray-800',
};

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await requireAdmin();
  if (!session) redirect('/auth/signin');

  const users = await prisma.user.findMany({
    where: searchParams.q ? {
      OR: [
        { name: { contains: searchParams.q, mode: 'insensitive' } },
        { email: { contains: searchParams.q, mode: 'insensitive' } },
      ],
    } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <form className="mb-4">
        <input name="q" defaultValue={searchParams.q} placeholder="Search users..." className="border rounded-lg px-4 py-2 w-72" />
        <button className="ml-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">Search</button>
      </form>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b text-left text-gray-500">
            <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{u.name || '—'}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${roleBadgeColors[u.role]}`}>{u.role}</span></td>
                <td className="p-3 text-gray-500">{u.createdAt.toLocaleDateString()}</td>
                <td className="p-3">
                  <form action={`/api/admin/users/${u.id}/toggle-ban`} method="POST">
                    <button className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100">Ban</button>
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
