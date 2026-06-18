'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  product: { title: string };
}

interface SellerOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string; email: string };
  items: OrderItem[];
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/seller/orders').then(r => r.json()).then(res => setOrders(res.data?.orders || [])).finally(() => setLoading(false));
  }, []);

  const markShipped = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const trackingNumber = trackingInputs[orderId] || '';
      await fetch('/api/seller/orders/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, trackingNumber }),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'SHIPPED' } : o));
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Seller Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.user.name || order.user.email} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product.title} × {item.quantity}</span>
                    <span>${Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                <div className="flex gap-2 items-center mt-3 pt-3 border-t">
                  <input
                    type="text"
                    placeholder="Tracking number"
                    value={trackingInputs[order.id] || ''}
                    onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                    className="border rounded px-3 py-1.5 text-sm flex-1"
                  />
                  <button
                    onClick={() => markShipped(order.id)}
                    disabled={actionLoading === order.id}
                    className="bg-amazon-orange text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-orange-500 disabled:opacity-50"
                  >
                    {actionLoading === order.id ? 'Processing...' : 'Mark Shipped'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
