import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CATEGORIES = ['order', 'promo', 'system', 'social'];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prefs = await prisma.notificationPreference.findMany({
    where: { userId: session.user.id },
  });

  // Return with defaults for missing categories
  const result = CATEGORIES.map(cat => {
    const existing = prefs.find(p => p.category === cat);
    return existing || { category: cat, email: true, push: true, sms: false, inApp: true };
  });

  return NextResponse.json({ preferences: result });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { preferences } = await req.json();

  if (!Array.isArray(preferences)) {
    return NextResponse.json({ error: 'preferences must be an array' }, { status: 400 });
  }

  const results = await Promise.all(
    preferences.map((pref: { category: string; email?: boolean; push?: boolean; sms?: boolean; inApp?: boolean }) =>
      prisma.notificationPreference.upsert({
        where: { userId_category: { userId: session.user.id, category: pref.category } },
        update: { email: pref.email, push: pref.push, sms: pref.sms, inApp: pref.inApp },
        create: {
          userId: session.user.id,
          category: pref.category,
          email: pref.email ?? true,
          push: pref.push ?? true,
          sms: pref.sms ?? false,
          inApp: pref.inApp ?? true,
        },
      })
    )
  );

  return NextResponse.json({ preferences: results });
}
