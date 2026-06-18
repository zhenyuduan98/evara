'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`).then(r => r.json()).then(data => setOrder(data.order));
    }
  }, [orderId]);

  if (!order) return <div className="max-w-2xl mx-auto p-6 text-center"><p>Loading...</p></div>;

  const items = order.items as Array<Record<string, unknown>> | undefined;

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="text-green-500 text-6xl mb-4">✓</div>
      <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-gray-600 mb-6">Thank you for your purchase.</p>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <p className="text-sm text-gray-500">Order Number</p>
        <p className="text-2xl font-mono font-bold">{order.orderNumber as string}</p>
      </div>

      <div className="text-left border rounded p-4 mb-6">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        {items?.map((item) => (
          <div key={item.id as string} className="flex justify-between py-1">
            <span>{item.title as string} × {item.quantity as number}</span>
            <span>${(Number(item.price) * (item.quantity as number)).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t mt-2 pt-2 font-bold flex justify-between">
          <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link href={`/account/orders/${order.id}`} className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-semibold">
          View Order
        </Link>
        <Link href="/" className="border px-6 py-2 rounded">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-6 text-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
