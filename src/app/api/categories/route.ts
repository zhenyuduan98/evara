import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import { cacheWrap } from '@/lib/redis';

interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  children: CategoryTree[];
}

export async function GET() {
  try {
    const categories = await cacheWrap<CategoryTree[]>('categories:tree', 300, async () => {
      return await prisma.category.findMany({
        include: { children: { include: { children: true } } },
        where: { parentId: null },
        orderBy: { name: 'asc' },
      }) as CategoryTree[];
    });

    return successResponse(categories);
  } catch (error) {
    console.error('Categories GET error:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}
