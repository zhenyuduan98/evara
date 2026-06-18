import { prisma } from '@/lib/prisma';

interface Context {
  userId?: string;
}

export const resolvers = {
  Query: {
    products: async (_: unknown, args: { search?: string; category?: string; limit?: number; offset?: number }) => {
      const { search, category, limit = 20, offset = 0 } = args;
      const where: Record<string, unknown> = { status: 'ACTIVE' };
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (category) {
        where.categories = { some: { slug: category } };
      }
      const products = await prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        include: { images: true, categories: true, seller: true },
      });
      return products.map(mapProduct);
    },
    product: async (_: unknown, { slug }: { slug: string }) => {
      const p = await prisma.product.findUnique({
        where: { slug },
        include: { images: true, categories: true, seller: true },
      });
      return p ? mapProduct(p) : null;
    },
    cart: async (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.userId) return null;
      const cart = await prisma.cart.findUnique({
        where: { userId: ctx.userId },
        include: { items: { include: { product: { include: { images: true } } } } },
      });
      if (!cart) return null;
      return {
        id: cart.id,
        items: cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: mapProduct(item.product as any),
        })),
      };
    },
    orders: async (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.userId) return [];
      const orders = await prisma.order.findMany({
        where: { userId: ctx.userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
      return orders.map((o) => ({
        id: o.id,
        status: o.status,
        total: Number(o.total),
        items: o.items.map((i) => ({
          id: i.id,
          title: i.title,
          price: Number(i.price),
          quantity: i.quantity,
          imageUrl: i.imageUrl,
        })),
        createdAt: o.createdAt.toISOString(),
      }));
    },
    reviews: async (_: unknown, { productId }: { productId: string }) => {
      const reviews = await prisma.review.findMany({
        where: { productId, hidden: false },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
      return reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.body,
        user: { id: r.user.id, name: r.user.name, email: r.user.email },
        createdAt: r.createdAt.toISOString(),
      }));
    },
  },
  Mutation: {
    addToCart: async (_: unknown, { productId, quantity = 1 }: { productId: string; quantity?: number }, ctx: Context) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      let cart = await prisma.cart.findUnique({ where: { userId: ctx.userId } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId: ctx.userId } });
      }
      const item = await prisma.cartItem.upsert({
        where: { cartId_productId_variantId: { cartId: cart.id, productId, variantId: null } },
        update: { quantity: { increment: quantity } },
        create: { cartId: cart.id, productId, quantity },
        include: { product: { include: { images: true } } },
      });
      return { id: item.id, quantity: item.quantity, product: mapProduct(item.product as any) };
    },
    removeFromCart: async (_: unknown, { itemId }: { itemId: string }, ctx: Context) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      await prisma.cartItem.delete({ where: { id: itemId } });
      return true;
    },
    updateCartQuantity: async (_: unknown, { itemId, quantity }: { itemId: string; quantity: number }, ctx: Context) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      const item = await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
        include: { product: { include: { images: true } } },
      });
      return { id: item.id, quantity: item.quantity, product: mapProduct(item.product as any) };
    },
    createReview: async (_: unknown, args: { productId: string; rating: number; title: string; comment: string }, ctx: Context) => {
      if (!ctx.userId) throw new Error('Not authenticated');
      const review = await prisma.review.create({
        data: {
          userId: ctx.userId,
          productId: args.productId,
          rating: args.rating,
          title: args.title,
          body: args.comment,
        },
        include: { user: true },
      });
      // Update product review count/rating
      const agg = await prisma.review.aggregate({
        where: { productId: args.productId },
        _avg: { rating: true },
        _count: true,
      });
      await prisma.product.update({
        where: { id: args.productId },
        data: { averageRating: agg._avg.rating || 0, reviewCount: agg._count },
      });
      return {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.body,
        user: { id: review.user.id, name: review.user.name, email: review.user.email },
        createdAt: review.createdAt.toISOString(),
      };
    },
  },
};

function mapProduct(p: any) {
  return {
    id: p.id,
    name: p.title,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    images: p.images?.map((i: any) => i.url) || [],
    rating: p.averageRating,
    reviewCount: p.reviewCount,
    brand: p.brand,
    category: p.categories?.[0] || null,
    seller: p.seller ? { id: p.seller.id, name: p.seller.name, email: p.seller.email } : null,
  };
}
