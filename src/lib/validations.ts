import { z } from 'zod';

export function passwordStrengthCheck(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[a-z]/.test(password)) errors.push('Must contain a lowercase letter');
  if (!/[A-Z]/.test(password)) errors.push('Must contain an uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('Must contain a number');
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push('Must contain a special character');
  return { valid: errors.length === 0, errors };
}

export function getPasswordStrengthLabel(password: string): string {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productCreateSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().min(1).max(10000),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).optional(),
});

export const orderCreateSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  shippingMethod: z.enum(['standard', 'express', 'nextday']).default('standard'),
  giftWrap: z.boolean().default(false),
  giftMessage: z.string().max(500).optional(),
});

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Review body is required').max(5000),
  images: z.array(z.string().url()).optional(),
});

export const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  shippingMethod: z.enum(['standard', 'express', 'nextday']).default('standard'),
  giftWrap: z.boolean().default(false),
  giftMessage: z.string().max(500).optional(),
  couponCode: z.string().optional(),
  useWallet: z.boolean().default(false),
  walletAmount: z.number().min(0).optional(),
  giftCardCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestCartId: z.string().optional(),
});

export const cartAddSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(10).default(1),
});

export const cartUpdateSchema = z.object({
  itemId: z.string().min(1, 'itemId is required'),
  quantity: z.number().int().min(1).max(10),
});
