import { getServerSession as nextGetServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';

export async function getServerSession() {
  return nextGetServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return null;
  }
  return session;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
