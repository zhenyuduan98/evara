import { describe, it, expect, vi } from 'vitest';

// Mock redis before importing rate-limit
vi.mock('@/lib/redis', () => ({
  redis: {
    multi: () => ({
      incr: vi.fn().mockReturnThis(),
      ttl: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([[null, 1], [null, 10]]),
    }),
    expire: vi.fn(),
  },
}));

import { rateLimit, sanitizeInput, apiError } from '@/lib/rate-limit';

function createMockReq(ip: string) {
  const headers = new Headers();
  headers.set('x-forwarded-for', ip);
  return { headers } as any;
}

describe('Rate Limiter', () => {
  it('allows first request', async () => {
    const result = await rateLimit(createMockReq('10.0.0.1'));
    expect(result.allowed).toBe(true);
  });

  it('returns remaining tokens', async () => {
    const result = await rateLimit(createMockReq('10.0.0.2'));
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it('includes rate limit headers', async () => {
    const result = await rateLimit(createMockReq('10.0.0.3'));
    expect(result.headers['X-RateLimit-Limit']).toBeDefined();
    expect(result.headers['X-RateLimit-Remaining']).toBeDefined();
  });
});

describe('sanitizeInput', () => {
  it('strips angle brackets', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<');
  });

  it('strips javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).not.toContain('javascript:');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});

describe('apiError', () => {
  it('creates error response object', () => {
    const err = apiError('Not found', 'NOT_FOUND', 404);
    expect(err.error).toBe('Not found');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.status).toBe(404);
  });
});
