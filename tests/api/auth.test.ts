import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '@/lib/validations';

describe('Auth Validation', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const result = registerSchema.safeParse({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('rejects missing name', () => {
      const result = registerSchema.safeParse({ email: 'john@example.com', password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({ name: 'John', email: 'not-email', password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({ name: 'John', email: 'john@example.com', password: '123' });
      expect(result.success).toBe(false);
    });

    it('rejects short name', () => {
      const result = registerSchema.safeParse({ name: 'J', email: 'john@example.com', password: 'password123' });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const result = loginSchema.safeParse({ email: 'john@example.com', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('rejects missing password', () => {
      const result = loginSchema.safeParse({ email: 'john@example.com' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({ email: 'bad', password: 'pass' });
      expect(result.success).toBe(false);
    });
  });
});
