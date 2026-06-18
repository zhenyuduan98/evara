import { describe, it, expect } from 'vitest';
import { cartAddSchema, cartUpdateSchema } from '@/lib/validations';

describe('Cart Validation', () => {
  describe('cartAddSchema', () => {
    it('accepts valid add item', () => {
      const result = cartAddSchema.safeParse({ productId: 'prod-1', quantity: 2 });
      expect(result.success).toBe(true);
    });

    it('defaults quantity to 1', () => {
      const result = cartAddSchema.safeParse({ productId: 'prod-1' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.quantity).toBe(1);
    });

    it('rejects missing productId', () => {
      const result = cartAddSchema.safeParse({ quantity: 1 });
      expect(result.success).toBe(false);
    });

    it('rejects quantity over 10', () => {
      const result = cartAddSchema.safeParse({ productId: 'prod-1', quantity: 11 });
      expect(result.success).toBe(false);
    });

    it('rejects quantity of 0', () => {
      const result = cartAddSchema.safeParse({ productId: 'prod-1', quantity: 0 });
      expect(result.success).toBe(false);
    });
  });

  describe('cartUpdateSchema', () => {
    it('accepts valid update', () => {
      const result = cartUpdateSchema.safeParse({ itemId: 'item-1', quantity: 3 });
      expect(result.success).toBe(true);
    });

    it('rejects missing itemId', () => {
      const result = cartUpdateSchema.safeParse({ quantity: 1 });
      expect(result.success).toBe(false);
    });
  });
});
