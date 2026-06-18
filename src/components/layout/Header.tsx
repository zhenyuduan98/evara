'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import SearchBar from '@/components/search/SearchBar';
import PrimeBadge from '@/components/ui/PrimeBadge';
import NotificationBell from '@/components/notifications/NotificationBell';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';

interface MiniCartItem {
  id: string;
  quantity: number;
  product: { id: string; title: string; price: string; images: { url: string }[] };
  variant: { price: string | null } | null;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<MiniCartItem[]>([]);
  const { status, data: session } = useSession();
  const miniCartRef = useRef<HTMLDivElement>(null);
  const [memberTier, setMemberTier] = useState<string>('');
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/cart').then(r => r.json()).then(data => {
        const items = (data.cart?.items || []).filter((i: { savedForLater: boolean }) => !i.savedForLater);
        setCartItems(items);
      }).catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/membership').then(r => r.json()).then(d => setMemberTier(d.membership?.tier || 'FREE')).catch(() => {});
      fetch('/api/wishlist').then(r => r.json()).then(d => { if (Array.isArray(d)) setWishlistCount(d.length); }).catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (miniCartRef.current && !miniCartRef.current.contains(e.target as Node)) {
        setMiniCartOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMiniCartOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const lastThree = cartItems.slice(0, 3);

  return (
    <header className="sticky top-0 z-50" role="banner">
      {/* Top Bar */}
      <div className="bg-amazon-dark text-white">
        <div className="flex items-center px-2 py-2 gap-2 md:gap-4 max-w-screen-2xl mx-auto">
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white text-2xl px-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 border border-transparent hover:border-white rounded p-1 text-white no-underline">
            <span className="text-xl font-bold">
              <span className="text-amazon-orange">Eva</span>
              <span>ra</span>
            </span>
          </Link>

          {/* Deliver to */}
          <div className="hidden md:flex items-center border border-transparent hover:border-white rounded p-1 cursor-pointer text-sm">
            <span className="text-xl mr-1">📍</span>
            <div>
              <p className="text-gray-300 text-xs leading-tight">Deliver to</p>
              <p className="font-bold leading-tight">United States</p>
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar />

          {/* Language */}
          <div className="hidden lg:flex items-center border border-transparent hover:border-white rounded p-1 cursor-pointer text-sm">
            <span className="text-lg mr-1">🌐</span>
            <span className="font-bold">EN</span>
          </div>

          {/* Account */}
          <Link href="/account" className="hidden md:block border border-transparent hover:border-white rounded p-1 text-white no-underline text-sm">
            <p className="text-xs text-gray-300 leading-tight">Hello, {session?.user?.name || 'Sign in'}</p>
            <p className="font-bold leading-tight">Account &amp; Lists <PrimeBadge tier={memberTier} /></p>
          </Link>

          {/* Returns & Orders */}
          <Link href="/orders" className="hidden md:block border border-transparent hover:border-white rounded p-1 text-white no-underline text-sm">
            <p className="text-xs text-gray-300 leading-tight">Returns</p>
            <p className="font-bold leading-tight">&amp; Orders</p>
          </Link>

          {/* Notifications */}
          {status === 'authenticated' && <NotificationBell />}

          {/* Language/Currency Switcher */}
          <LocaleSwitcher />
          <CurrencySwitcher />
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />

          {status === 'authenticated' && (
            <Link href="/account/wishlist" className="relative border border-transparent hover:border-white rounded p-1 text-white no-underline">
              <span className="text-2xl">♥</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 right-0 bg-amazon-orange text-amazon-dark text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart with Mini-Cart Dropdown */}
          <div className="relative" ref={miniCartRef}>
            <button
              onClick={() => setMiniCartOpen(!miniCartOpen)}
              onMouseEnter={() => setMiniCartOpen(true)}
              className="flex items-center border border-transparent hover:border-white rounded p-1 text-white relative"
            >
              <div className="relative" aria-label="Shopping cart">
                <span className="text-3xl" aria-hidden="true">🛒</span>
                <span className="absolute -top-1 right-0 bg-amazon-orange text-amazon-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="hidden md:inline font-bold text-sm ml-1">Cart</span>
            </button>

            {miniCartOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 text-black dark:text-gray-100 rounded-lg shadow-xl border dark:border-gray-700 z-50" role="menu" aria-live="polite">
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-3">Shopping Cart ({cartCount} items)</h3>
                  {lastThree.length === 0 ? (
                    <p className="text-gray-500 text-sm">Your cart is empty</p>
                  ) : (
                    <>
                      {lastThree.map((item) => {
                        const price = parseFloat(item.variant?.price || item.product.price);
                        return (
                          <div key={item.id} className="flex gap-3 py-2 border-b last:border-0">
                            {item.product.images[0] && (
                              <Image src={item.product.images[0].url} alt="" className="w-12 h-12 object-cover rounded"  width={48} height={48} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs line-clamp-2">{item.product.title}</p>
                              <p className="text-sm font-bold">${price.toFixed(2)} × {item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                      {cartItems.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2">+{cartItems.length - 3} more items</p>
                      )}
                    </>
                  )}
                  <Link
                    href="/cart"
                    className="block mt-3 text-center bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold py-2 rounded"
                    onClick={() => setMiniCartOpen(false)}
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="bg-amazon-light text-white text-sm" role="navigation" aria-label="Main navigation">
        <div className="flex items-center gap-1 px-2 py-1 max-w-screen-2xl mx-auto overflow-x-auto whitespace-nowrap">
          <button className="flex items-center gap-1 font-bold border border-transparent hover:border-white rounded px-2 py-1">
            <span>☰</span> All
          </button>
          {["Today's Deals", 'Customer Service', 'Registry', 'Gift Cards', 'Sell'].map((item) => (
            <Link
              key={item}
              href="#"
              className="border border-transparent hover:border-white rounded px-2 py-1 text-white no-underline hidden sm:inline-block"
            >
              {item}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white text-black overflow-y-auto">
            <div className="bg-amazon-light text-white p-4 font-bold text-lg">
              <span>👤 Hello, Sign in</span>
            </div>
            <nav className="p-4">
              <p className="font-bold text-lg mb-2">Shop By Department</p>
              {['Electronics', 'Computers', 'Books', 'Clothing', 'Home & Kitchen', 'Toys & Games'].map((dept) => (
                <Link
                  key={dept}
                  href="#"
                  className="block py-2 border-b border-gray-200 text-black no-underline hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {dept}
                </Link>
              ))}
              <p className="font-bold text-lg mt-4 mb-2">Quick Links</p>
              {["Today's Deals", 'Customer Service', 'Gift Cards', 'Sell', 'Returns & Orders'].map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="block py-2 border-b border-gray-200 text-black no-underline hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
