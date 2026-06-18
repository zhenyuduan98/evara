import { describe, it, expect } from 'vitest';
import {
  registerSchema, loginSchema, productCreateSchema, orderCreateSchema,
  reviewCreateSchema, checkoutSchema, cartAddSchema, cartUpdateSchema,
} from '@/lib/validations';

describe('Validation Schemas', () => {
  describe('reviewCreateSchema', () => {
    it('accepts valid review', () => {
      const result = reviewCreateSchema.safeParse({ rating: 5, title: 'Great!', body: 'Loved it' });
      expect(result.success).toBe(true);
    });

    it('rejects rating of 0', () => {
      const result = reviewCreateSchema.safeParse({ rating: 0, title: 'Bad', body: 'Terrible' });
      expect(result.success).toBe(false);
    });

    it('rejects rating of 6', () => {
      const result = reviewCreateSchema.safeParse({ rating: 6, title: 'Good', body: 'Nice' });
      expect(result.success).toBe(false);
    });

    it('rejects empty title', () => {
      const result = reviewCreateSchema.safeParse({ rating: 3, title: '', body: 'Ok' });
      expect(result.success).toBe(false);
    });

    it('accepts review with images', () => {
      const result = reviewCreateSchema.safeParse({
        rating: 4, title: 'Nice', body: 'Good product', images: ['https://example.com/img.jpg'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('checkoutSchema', () => {
    it('rejects empty address', () => {
      const result = checkoutSchema.safeParse({ shippingAddressId: '' });
      expect(result.success).toBe(false);
    });

    it('defaults giftWrap to false', () => {
      const result = checkoutSchema.safeParse({ shippingAddressId: 'addr-1' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.giftWrap).toBe(false);
    });
  });

  describe('cartAddSchema with variantId', () => {
    it('accepts null variantId', () => {
      const result = cartAddSchema.safeParse({ productId: 'p1', variantId: null });
      expect(result.success).toBe(true);
    });
  });
});
