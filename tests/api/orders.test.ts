import { describe, it, expect } from 'vitest';
import { orderCreateSchema, checkoutSchema } from '@/lib/validations';

describe('Orders Validation', () => {
  it('accepts valid order', () => {
    const result = orderCreateSchema.safeParse({ shippingAddressId: 'addr-1', shippingMethod: 'express' });
    expect(result.success).toBe(true);
  });

  it('defaults shipping method to standard', () => {
    const result = orderCreateSchema.safeParse({ shippingAddressId: 'addr-1' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.shippingMethod).toBe('standard');
  });

  it('rejects invalid shipping method', () => {
    const result = orderCreateSchema.safeParse({ shippingAddressId: 'addr-1', shippingMethod: 'teleport' });
    expect(result.success).toBe(false);
  });

  it('rejects missing address', () => {
    const result = orderCreateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  describe('checkoutSchema', () => {
    it('accepts valid checkout with gift wrap', () => {
      const result = checkoutSchema.safeParse({ shippingAddressId: 'addr-1', giftWrap: true, giftMessage: 'Happy birthday!' });
      expect(result.success).toBe(true);
    });
  });
});
