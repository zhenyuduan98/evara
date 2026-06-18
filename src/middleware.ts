import { withAuth } from 'next-auth/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { isMaintenanceMode } from './lib/maintenance';
import { trackRequest } from './lib/metrics';

// Simple in-memory rate limiter for API routes
const rateBuckets = new Map<string, { tokens: number; lastRefill: number }>();
const MAX_TOKENS = 60;
const REFILL_RATE = 10;

function rateLimitCheck(req: NextRequest): { allowed: boolean; remaining: number; headers: Record<string, string> } {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  let bucket = rateBuckets.get(ip);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: Date.now() };
    rateBuckets.set(ip, bucket);
  }
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor(elapsed / 1000) * REFILL_RATE;
  if (refill > 0) {
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refill);
    bucket.lastRefill = now;
  }
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(MAX_TOKENS),
    'X-RateLimit-Remaining': String(Math.max(0, bucket.tokens - 1)),
  };
  if (bucket.tokens <= 0) {
    return { allowed: false, remaining: 0, headers: { ...headers, 'Retry-After': '1' } };
  }
  bucket.tokens -= 1;
  headers['X-RateLimit-Remaining'] = String(bucket.tokens);
  return { allowed: true, remaining: bucket.tokens, headers };
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Maintenance mode check
    if (isMaintenanceMode() && !pathname.startsWith('/maintenance') && !pathname.startsWith('/api/admin/maintenance') && !pathname.startsWith('/api/auth')) {
      const token = req.nextauth.token;
      if (!token || (token as any).role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/maintenance', req.url));
      }
    }

    // Rate limit API routes
    // Request logging
    const start = Date.now();
    const method = req.method;
    const url = pathname;

    if (pathname.startsWith('/api/')) {
      const { allowed, headers } = rateLimitCheck(req);
      if (!allowed) {
        const duration = Date.now() - start;
        trackRequest(url, duration, 429);
        console.log(`[REQ] ${method} ${url} 429 ${duration}ms`);
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests', code: 'RATE_LIMITED', status: 429 }),
          { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }
      const response = NextResponse.next();
      Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      const duration = Date.now() - start;
      trackRequest(url, duration, 200);
      console.log(`[REQ] ${method} ${url} 200 ${duration}ms`);
      return response;
    }

    const token = req.nextauth.token;

    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow API routes through (rate limiting handles them)
        if (req.nextUrl.pathname.startsWith('/api/')) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/admin/:path*', '/api/:path*', '/maintenance'],
};
