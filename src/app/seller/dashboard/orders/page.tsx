'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: { title: string };
}

interface Order {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  user: { name: string | null; email: string | null };
  items: OrderItem[];
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/orders')
      .then(r => r.json())
      .then(res => setOrders(res.data?.orders || res.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono text-sm text-gray-500">Order #{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2">Customer: {order.user.name || order.user.email || 'Unknown'}</p>
                <div className="space-y-1">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.title} × {item.quantity}</span>
                      <span className="font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
