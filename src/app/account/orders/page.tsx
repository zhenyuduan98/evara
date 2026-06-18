'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-orange-100 text-orange-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reorderMsg, setReorderMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders?page=${page}`).then(r => r.json()).then(data => {
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    });
  }, [page]);

  const handleReorder = async (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await fetch(`/api/orders/${orderId}/reorder`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setReorderMsg(data.message || 'Items added to cart!');
      setTimeout(() => setReorderMsg(''), 3000);
    } else {
      setReorderMsg(data.error || 'Failed to reorder');
      setTimeout(() => setReorderMsg(''), 3000);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {reorderMsg && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">{reorderMsg}</div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No orders yet.</p>
          <Link href="/" className="bg-yellow-400 px-6 py-2 rounded font-semibold">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
{orders.map((order: Record<string, unknown>) => (
            <Link key={order.id as string} href={`/account/orders/${order.id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm text-gray-500">{order.orderNumber as string}</p>
                  <p className="font-semibold">{(order.items as Array<unknown>)?.length} item(s)</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt as string).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[order.status as string] || ''}`}>
                    {order.status as string}
                  </span>
                  <p className="font-bold mt-1">${Number(order.total).toFixed(2)}</p>
                  <button onClick={(e) => handleReorder(e, order.id as string)}
                    className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-xs px-3 py-1 rounded font-semibold">
                    🔄 Buy Again
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50">Previous</button>
          <span className="px-4 py-2">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
