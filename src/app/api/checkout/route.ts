import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';
import { checkoutSchema } from '@/lib/validations';
import { Decimal } from '@prisma/client/runtime/library';
import { scoreOrder } from '@/lib/fraud';

interface CartItemWithProduct {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    price: Decimal;
    sellerId: string;
    images?: { url: string }[];
  };
  variantId: string | null;
  variant: {
    id: string;
    name: string;
    price: Decimal | null;
    stock: number;
  } | null;
  quantity: number;
}

function calculateShippingRate(method: string, _itemCount: number): number {
  const rates: Record<string, number> = {
    standard: 5.99,
    express: 12.99,
    nextday: 24.99,
  };
  return rates[method] ?? 5.99;
}

export async function POST(req: NextRequest) {
 try {
   const session = await getServerSession();
    let body;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid or missing request body', 400);
    }
   const parsedBody = checkoutSchema.safeParse(body);
    if (!parsedBody.success) return errorResponse(parsedBody.error.issues?.[0]?.message || parsedBody.error.message);

    const {
      shippingAddressId,
      shippingMethod,
      giftWrap,
      giftMessage,
      couponCode,
      useWallet,
      walletAmount,
      giftCardCode,
      guestEmail,
      guestCartId,
    } = parsedBody.data;

    // Determine user or guest
    let user: { id: string; email: string | null } | null = null;
    let isGuest = false;

    if (session?.user?.email) {
      user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (!user) return errorResponse('User not found', 404);
    } else if (guestEmail && guestCartId) {
      isGuest = true;
    } else {
      return errorResponse('Unauthorized - provide login or guestEmail+guestCartId', 401);
    }

    // Validate address
    const address = await prisma.address.findFirst({
      where: { id: shippingAddressId, ...(user ? { userId: user.id } : {}) },
    });
    if (!address) return errorResponse('Invalid shipping address');

    // Get cart items
    let cartItems: CartItemWithProduct[] = [];

    if (isGuest) {
      const guestCart = await prisma.guestCart.findUnique({ where: { id: guestCartId! } });
      if (!guestCart) return errorResponse('Guest cart not found');
      const items = guestCart.items as Array<{ productId: string; variantId?: string; quantity: number }>;
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { images: { take: 1 } },
        });
        if (!product) continue;
        const variant = item.variantId
          ? await prisma.productVariant.findUnique({ where: { id: item.variantId } })
          : null;
        cartItems.push({
          id: `guest-${item.productId}-${item.variantId || ''}`,
          productId: item.productId,
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            sellerId: product.sellerId,
            images: product.images as { url: string }[],
          },
          variantId: item.variantId || null,
          variant,
          quantity: item.quantity,
        });
      }
    } else {
      const cart = await prisma.cart.findUnique({
        where: { userId: user!.id },
        include: {
          items: {
            where: { savedForLater: false },
            include: { product: { include: { images: { take: 1 } } }, variant: true },
          },
        },
      });
      if (!cart || cart.items.length === 0) return errorResponse('Cart is empty');
      cartItems = cart.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images as { url: string }[],
        },
      }));
    }

    if (cartItems.length === 0) return errorResponse('Cart is empty');

    // Validate stock
    for (const item of cartItems) {
      if (item.variant && item.variant.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${item.product.title} - ${item.variant.name}`);
      }
    }

    // Group items by seller for order splitting
    const sellerGroups: Record<string, CartItemWithProduct[]> = {};
    for (const item of cartItems) {
      const sid = item.product.sellerId;
      if (!sellerGroups[sid]) sellerGroups[sid] = [];
      sellerGroups[sid].push(item);
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant?.price ?? item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);

    // Apply coupon
    let discount = 0;
    let couponId: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon) return errorResponse('Invalid coupon code');
      if (!coupon.isActive) return errorResponse('Coupon is no longer active');
      if (coupon.expiresAt && coupon.expiresAt < new Date()) return errorResponse('Coupon has expired');
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) return errorResponse('Coupon usage limit reached');
      if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
        return errorResponse(`Minimum order amount of $${coupon.minOrderAmount} not met`);
      }
      if (coupon.type === 'PERCENTAGE') {
        discount = Math.round(subtotal * Number(coupon.value) / 100 * 100) / 100;
      } else {
        discount = Math.min(Number(coupon.value), subtotal);
      }
      couponId = coupon.id;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { currentUses: { increment: 1 } } });
    }

    // Gift card
    let giftCardDeduction = 0;
    if (giftCardCode) {
      const giftCard = await prisma.giftCard.findUnique({ where: { code: giftCardCode } });
      if (!giftCard) return errorResponse('Invalid gift card code');
      if (!giftCard.isActive) return errorResponse('Gift card is inactive');
      if (giftCard.expiresAt && giftCard.expiresAt < new Date()) return errorResponse('Gift card has expired');
      const gcBalance = Number(giftCard.balance);
      const afterDiscount = subtotal - discount;
      giftCardDeduction = Math.min(gcBalance, afterDiscount);
      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { balance: { decrement: giftCardDeduction } },
      });
    }

    // Shipping per seller
    const sellerIds = Object.keys(sellerGroups);
    let totalShipping = 0;
    const sellerShipping: Record<string, number> = {};
    for (const sid of sellerIds) {
      const cost = calculateShippingRate(shippingMethod, sellerGroups[sid].length);
      sellerShipping[sid] = cost;
      totalShipping += cost;
    }

    const giftWrapCost = giftWrap ? 5.99 : 0;
    const afterDiscounts = Math.max(subtotal - discount - giftCardDeduction, 0);
    const tax = Math.round(afterDiscounts * 0.08 * 100) / 100;
    let total = Math.round((afterDiscounts + totalShipping + giftWrapCost + tax) * 100) / 100;

    // Wallet deduction
    let walletDeduction = 0;
    if (useWallet && user) {
      const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
      if (wallet) {
        const available = Number(wallet.balance);
        const requested = walletAmount !== undefined ? Math.min(walletAmount, available) : available;
        walletDeduction = Math.min(requested, total);
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: walletDeduction } },
        });
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: walletDeduction,
            type: 'DEBIT',
            description: 'Checkout payment',
          },
        });
        total = Math.round((total - walletDeduction) * 100) / 100;
      }
    }

    // Decrement stock
    for (const item of cartItems) {
      if (item.variant) {
        await prisma.productVariant.update({
          where: { id: item.variant.id },
          data: { stock: { decrement: item.quantity } },
        });
        await prisma.inventoryLog.create({
          data: {
            productId: item.productId,
            variantId: item.variant.id,
            type: 'SALE',
            quantity: -item.quantity,
            note: 'Checkout order',
          },
        });
      }
    }

    // For guest, create a temporary user or use existing by email
    let orderUserId = user?.id;
    if (isGuest && guestEmail) {
      let guestUser = await prisma.user.findUnique({ where: { email: guestEmail } });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: { email: guestEmail, name: 'Guest' },
        });
        // Link address to guest user
        await prisma.address.update({ where: { id: shippingAddressId }, data: { userId: guestUser.id } });
      }
      orderUserId = guestUser.id;
    }

    if (!orderUserId) return errorResponse('Unable to determine user for order');

    // Create orders split by seller
    const orders = [];
    for (const sid of sellerIds) {
      const items = sellerGroups[sid];
      const sellerSubtotal = items.reduce((sum, item) => {
        const price = item.variant?.price ?? item.product.price;
        return sum + Number(price) * item.quantity;
      }, 0);
      const proportion = subtotal > 0 ? sellerSubtotal / subtotal : 1 / sellerIds.length;
      const sellerDiscount = Math.round(discount * proportion * 100) / 100;
      const sellerGc = Math.round(giftCardDeduction * proportion * 100) / 100;
      const sellerAfter = Math.max(sellerSubtotal - sellerDiscount - sellerGc, 0);
      const sellerTax = Math.round(sellerAfter * 0.08 * 100) / 100;
      const sellerTotal = Math.round((sellerAfter + sellerShipping[sid] + (giftWrap ? 5.99 / sellerIds.length : 0) + sellerTax) * 100) / 100;

      const order = await prisma.order.create({
        data: {
          userId: orderUserId,
          subtotal: sellerSubtotal,
          shippingCost: sellerShipping[sid],
          tax: sellerTax,
          total: sellerTotal,
          shippingAddressId,
          shippingMethod,
          couponId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.product.title,
              price: item.variant?.price ?? item.product.price,
              quantity: item.quantity,
              imageUrl: item.product.images?.[0]?.url || null,
            })),
          },
        },
        include: { items: true },
      });
      orders.push(order);
    }

    // Fraud scoring for each order
    const fraudResults = [];
    for (const order of orders) {
      try {
        const result = await scoreOrder({
          id: order.id,
          userId: orderUserId,
          total: order.total,
          shippingAddressId,
        });
        fraudResults.push(result);
      } catch (e) {
        console.error('Fraud scoring error:', e);
      }
    }

    // Create Stripe PaymentIntent only if remaining total > 0
    let clientSecret: string | null = null;
    let paymentIntentId: string | null = null;

    if (total > 0) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'usd',
        metadata: {
          userId: orderUserId,
          orderIds: orders.map((o) => o.id).join(','),
          shippingAddressId,
          shippingMethod,
          giftWrap: giftWrap ? 'true' : 'false',
          giftMessage: giftMessage || '',
        },
      });
      clientSecret = paymentIntent.client_secret;
      paymentIntentId = paymentIntent.id;

      // Update orders with payment intent
      for (const order of orders) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentIntentId: paymentIntent.id },
        });
      }
    } else {
      // Wallet/gift card covered everything - mark as paid
      for (const order of orders) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED', paidAt: new Date() },
        });
      }
    }

    // Clear cart
    if (!isGuest && user) {
      const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id, savedForLater: false } });
      }
    } else if (guestCartId) {
      await prisma.guestCart.delete({ where: { id: guestCartId } }).catch(() => {});
    }

    return successResponse({
      clientSecret,
      paymentIntentId,
      orders: orders.map((o) => ({ id: o.id, orderNumber: o.orderNumber, total: o.total })),
      subtotal,
      discount,
      giftCardDeduction,
      walletDeduction,
      shippingCost: totalShipping,
      tax,
      total: total + walletDeduction, // total before wallet
      amountDue: total, // after wallet
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return errorResponse('Internal server error', 500);
  }
}
