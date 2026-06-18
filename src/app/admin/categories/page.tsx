import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-helpers';
import { redirect } from 'next/navigation';

interface CategoryWithChildren {
  id: string; name: string; slug: string;
  children: CategoryWithChildren[];
  _count: { products: number };
}

function CategoryTree({ categories, depth = 0 }: { categories: CategoryWithChildren[]; depth?: number }) {
  return (
    <ul className={depth > 0 ? 'ml-6 border-l pl-4' : ''}>
      {categories.map((c) => (
        <li key={c.id} className="py-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 text-xs text-gray-400">/{c.slug}</span>
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">{c._count.products} products</span>
            </div>
            <div className="flex gap-2">
              <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Edit</button>
              <button className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">Delete</button>
            </div>
          </div>
          {c.children.length > 0 && <CategoryTree categories={c.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

export default async function AdminCategoriesPage() {
  const session = await requireAdmin();
  if (!session) redirect('/auth/signin');

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      _count: { select: { products: true } },
      children: {
        include: {
          _count: { select: { products: true } },
          children: { include: { _count: { select: { products: true } }, children: { include: { _count: { select: { products: true } } } } } },
        },
      },
    },
    orderBy: { name: 'asc' },
  }) as unknown as CategoryWithChildren[];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Add Category</h2>
        <form action="/api/admin/categories" method="POST" className="flex gap-4">
          <input name="name" placeholder="Category name" required className="border rounded px-3 py-2 flex-1" />
          <input name="slug" placeholder="slug" required className="border rounded px-3 py-2 flex-1" />
          <select name="parentId" className="border rounded px-3 py-2">
            <option value="">No parent (root)</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="bg-gray-900 text-white px-4 py-2 rounded">Add</button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <CategoryTree categories={categories} />
        {categories.length === 0 && <p className="text-gray-400 text-center py-6">No categories yet</p>}
      </div>
    </div>
  );
}
