import { describe, it, expect } from 'vitest';
import { productCreateSchema } from '@/lib/validations';

describe('Products Validation', () => {
  it('accepts valid product', () => {
    const result = productCreateSchema.safeParse({
      name: 'Widget', description: 'A widget', price: 9.99, categoryId: 'cat-1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative price', () => {
    const result = productCreateSchema.safeParse({
      name: 'Widget', description: 'A widget', price: -5, categoryId: 'cat-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = productCreateSchema.safeParse({
      description: 'A widget', price: 9.99, categoryId: 'cat-1',
    });
    expect(result.success).toBe(false);
  });
});
