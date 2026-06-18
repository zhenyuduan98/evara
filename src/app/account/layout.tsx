'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const navItems = [
  { href: '/account/profile', label: 'Profile', icon: '👤' },
  { href: '/account/addresses', label: 'Addresses', icon: '📍' },
  { href: '/account/orders', label: 'Orders', icon: '📦' },
  { href: '/account/security', label: 'Security', icon: '🔒' },
  { href: '/account/membership', label: 'Membership', icon: '⭐' },
  { href: '/account/support', label: 'Support', icon: '🎧' },
  { href: '/account/notifications', label: 'Notifications', icon: '🔔' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center py-20">
        <p className="text-gray-500 mb-4">Please sign in to access your account.</p>
        <Link href="/auth/signin" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Account</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-56 shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
