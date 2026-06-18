'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CartItemType {
  id: string;
  quantity: number;
  savedForLater: boolean;
  product: {
    id: string;
    title: string;
    price: string;
    images: { url: string; alt: string | null }[];
    seller: { id: string; name: string | null } | null;
  };
  variant: {
    id: string;
    name: string;
    price: string | null;
    options: Record<string, string>;
  } | null;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    const res = await fetch('/api/cart');
    const data = await res.json();
    setItems(data.cart?.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') fetchCart();
    else if (status === 'unauthenticated') setLoading(false);
  }, [status, fetchCart]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity > 10) return;
    await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    });
    fetchCart();
  };

  const removeItem = async (itemId: string) => {
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    fetchCart();
  };

  const toggleSaveForLater = async (itemId: string) => {
    await fetch('/api/cart/save-for-later', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    fetchCart();
  };

  if (loading) return <div className="max-w-5xl mx-auto p-6">Loading...</div>;

  if (!session) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Shopping Cart</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your cart.</p>
        <Link href="/auth/signin" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded">
          Sign In
        </Link>
      </div>
    );
  }

  const cartItems = items.filter((i) => !i.savedForLater);
  const savedItems = items.filter((i) => i.savedForLater);

  const getPrice = (item: CartItemType) => {
    return parseFloat(item.variant?.price || item.product.price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);
  const taxRate = 0.08;
  const estimatedTax = Math.round(subtotal * taxRate * 100) / 100;
  const estimatedTotal = Math.round((subtotal + estimatedTax) * 100) / 100;

  // Group cart items by seller
  const sellerGroups = cartItems.reduce<Record<string, { sellerName: string; items: CartItemType[] }>>((groups, item) => {
    const sellerId = item.product.seller?.id || 'unknown';
    const sellerName = item.product.seller?.name || 'Evara';
    if (!groups[sellerId]) {
      groups[sellerId] = { sellerName, items: [] };
    }
    groups[sellerId].items.push(item);
    return groups;
  }, {});

  const ItemRow = ({ item, isSaved }: { item: CartItemType; isSaved: boolean }) => {
    const price = getPrice(item);
    const imgUrl = item.product.images[0]?.url || '/placeholder.png';

    return (
      <div className="flex gap-4 border-b py-4">
        <div className="w-24 h-24 relative flex-shrink-0 bg-gray-100 rounded">
          <Image src={imgUrl} alt={item.product.title} fill className="object-contain" sizes="96px" />
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.product.id}`} className="font-medium hover:text-blue-600 hover:underline line-clamp-2">
            {item.product.title}
          </Link>
          {item.variant && (
            <p className="text-sm text-gray-500 mt-1">
              {item.variant.name}{item.variant.options ? ` - ${Object.values(item.variant.options).join(', ')}` : ''}
            </p>
          )}
          <p className="text-lg font-bold mt-1">${price.toFixed(2)}</p>
          <div className="flex items-center gap-3 mt-2 text-sm">
            {!isSaved && (
              <select
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Qty: {n}</option>
                ))}
              </select>
            )}
            <button onClick={() => removeItem(item.id)} className="text-blue-600 hover:underline">Delete</button>
            <button onClick={() => toggleSaveForLater(item.id)} className="text-blue-600 hover:underline">
              {isSaved ? 'Move to Cart' : 'Save for Later'}
            </button>
          </div>
        </div>
        {!isSaved && (
          <div className="text-right font-bold whitespace-nowrap">
            ${(price * item.quantity).toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  if (cartItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Evara Cart is empty</h1>
        <Link href="/" className="text-blue-600 hover:underline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(sellerGroups).map(([sellerId, group]) => (
                <div key={sellerId} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <span className="text-sm font-semibold text-gray-700">Sold by:</span>
                    <span className="text-sm text-blue-600">{group.sellerName}</span>
                  </div>
                  {group.items.map((item) => (
                    <ItemRow key={item.id} item={item} isSaved={false} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">No items in cart</div>
          )}

          {savedItems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Saved for Later ({savedItems.length} items)</h2>
              <div className="bg-white rounded-lg shadow p-6">
                {savedItems.map((item) => (
                  <ItemRow key={item.id} item={item} isSaved={true} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary with Tax Preview */}
        {cartItems.length > 0 && (
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Estimated tax (8%)</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Calculated at checkout</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Estimated Total</span>
                  <span>${estimatedTotal.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block mt-4 text-center bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-lg"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
