import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const MAX_TOKENS = 100;
const WINDOW_SECONDS = 10;

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

export async function rateLimit(req: NextRequest): Promise<{ allowed: boolean; remaining: number; headers: Record<string, string> }> {
  const ip = getIP(req);
  const key = `rl:${ip}`;

  try {
    const multi = redis.multi();
    multi.incr(key);
    multi.ttl(key);
    const results = await multi.exec();
    
    const count = (results?.[0]?.[1] as number) || 1;
    const ttl = (results?.[1]?.[1] as number) || -1;

    if (ttl === -1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const limit = MAX_TOKENS;
    const remaining = Math.max(0, limit - count);

    const headers: Record<string, string> = {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(remaining),
    };

    if (count > limit) {
      return { allowed: false, remaining: 0, headers: { ...headers, 'Retry-After': String(WINDOW_SECONDS) } };
    }

    return { allowed: true, remaining, headers };
  } catch {
    // Fallback: allow if Redis is down
    return { allowed: true, remaining: MAX_TOKENS, headers: { 'X-RateLimit-Limit': String(MAX_TOKENS), 'X-RateLimit-Remaining': String(MAX_TOKENS) } };
  }
}

export function rateLimitResponse(req: NextRequest, response: NextResponse): NextResponse | Promise<NextResponse> {
  return (async () => {
    const { allowed, headers } = await rateLimit(req);
    
    if (!allowed) {
      return NextResponse.json(
        apiError('Too many requests', 'RATE_LIMITED', 429),
        { status: 429, headers }
      );
    }

    Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  })();
}

// Standardized API error response
export interface ApiErrorResponse {
  error: string;
  code: string;
  status: number;
}

export function apiError(error: string, code: string, status: number): ApiErrorResponse {
  return { error, code, status };
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // strip angle brackets
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;')
    .trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(sanitized[key] as string);
    }
  }
  return sanitized;
}
