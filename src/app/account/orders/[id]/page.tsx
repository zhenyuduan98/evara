'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_ICONS: Record<string, string> = {
  PENDING: '📋',
  CONFIRMED: '✅',
  PROCESSING: '⚙️',
  SHIPPED: '🚚',
  DELIVERED: '📦',
};
const STATUS_DESCRIPTIONS: Record<string, string> = {
  PENDING: 'Order placed and awaiting confirmation',
  CONFIRMED: 'Order confirmed by seller',
  PROCESSING: 'Order is being prepared',
  SHIPPED: 'Order is on its way',
  DELIVERED: 'Order has been delivered',
};

interface OrderItemType {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  productId: string;
  variantId?: string;
}

interface AddressType {
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
}

interface OrderType {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingMethod: string;
  createdAt: string;
  items: OrderItemType[];
  shippingAddress?: AddressType;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(data => {
      setOrder(data.order);
      setLoading(false);
    });
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    const res = await fetch(`/api/orders/${id}/cancel`, {
      method: 'POST',
    });
    const data = await res.json();
    if (res.ok) setOrder(data.order);
    else alert(data.error);
    setCancelling(false);
  };

  const handleBuyAgain = async (item: OrderItemType) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: item.productId, variantId: item.variantId, quantity: 1 }),
    });
    router.push('/cart');
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  if (!order) return <div className="max-w-4xl mx-auto p-6">Order not found.</div>;

  const currentIdx = STATUSES.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const isDelivered = order.status === 'DELIVERED';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/account/orders" className="text-blue-600 hover:underline text-sm">← Back to Orders</Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">Order {order.orderNumber}</h1>
      <p className="text-gray-500 mb-6">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>

      {/* Visual Order Status Timeline */}
      {!isCancelled ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">Order Status</h3>
          <div className="relative">
            {/* Progress bar background */}
            <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded" />
            {/* Progress bar fill */}
            <div
              className="absolute top-5 left-5 h-1 bg-green-500 rounded transition-all duration-500"
              style={{ width: `${currentIdx >= 0 ? (currentIdx / (STATUSES.length - 1)) * (100 - 5) : 0}%` }}
            />

            <div className="relative flex justify-between">
              {STATUSES.map((status, i) => (
                <div key={status} className="flex flex-col items-center z-10" style={{ width: '20%' }}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all
                      ${i <= currentIdx
                        ? 'bg-green-500 border-green-500 text-white shadow-md'
                        : i === currentIdx + 1
                          ? 'bg-white border-green-300 text-green-500'
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}
                  >
                    {i <= currentIdx ? '✓' : STATUS_ICONS[status]}
                  </div>
                  <span className={`text-xs mt-2 text-center font-medium ${
                    i <= currentIdx ? 'text-green-700' : 'text-gray-400'
                  }`}>
                    {status}
                  </span>
                  {i === currentIdx && (
                    <span className="text-xs text-gray-500 text-center mt-1 max-w-[100px]">
                      {STATUS_DESCRIPTIONS[status]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-semibold">Order {order.status}</p>
              <p className="text-sm">This order has been {order.status.toLowerCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold mb-3">Items</h3>
        {order.items?.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
            {item.imageUrl && (
              <Image src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded"  width={64} height={64} />
            )}
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</p>
              {isDelivered && (
                <button
                  onClick={() => handleBuyAgain(item)}
                  className="mt-1 text-xs bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-3 py-1 rounded"
                >
                  🔄 Buy Again
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.addressLine1}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="flex justify-between py-1"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
        <div className="flex justify-between py-1"><span>Shipping ({order.shippingMethod})</span><span>${Number(order.shippingCost).toFixed(2)}</span></div>
        <div className="flex justify-between py-1"><span>Tax</span><span>${Number(order.tax).toFixed(2)}</span></div>
        <div className="flex justify-between py-1 font-bold text-lg border-t mt-2 pt-2"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
      </div>

      {/* Cancel Button */}
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}
