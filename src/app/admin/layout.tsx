'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  { href: '/admin/sellers', label: 'Sellers', icon: '🏪' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { href: '/admin/categories', label: 'Categories', icon: '📂' },
  { href: '/admin/tickets', label: 'Tickets', icon: '🎧' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/help', label: 'Help Articles', icon: '📖' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-64px)]" role="application">
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 dark:bg-black" role="navigation" aria-label="Admin navigation">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>
        <nav className="p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))
                  ? 'bg-yellow-500 text-gray-900 font-semibold'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 p-6 overflow-auto">{children}</main>
    </div>
  );
}
