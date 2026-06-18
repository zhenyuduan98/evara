'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  items: { title: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  createdAt: string;
  order: {
    orderNumber: string;
    shippingMethod: string;
    shippingAddress: { name: string; addressLine1: string; city: string; state: string; zipCode: string };
    user: { name: string | null; email: string | null };
  };
}

export default function InvoicePage() {
  const params = useParams();
  const orderId = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${orderId}/invoice`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setInvoice(data.invoice || data);
      })
      .catch(() => setError('Failed to load invoice'));
  }, [orderId]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!invoice) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Print button - hidden when printing */}
      <div className="print:hidden mb-6 flex gap-3">
        <button onClick={() => window.print()} className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-semibold">
          🖨️ Print Invoice
        </button>
        <button onClick={() => window.history.back()} className="px-6 py-2 border rounded hover:bg-gray-50">
          Back
        </button>
      </div>

      {/* Invoice content */}
      <div className="border rounded-lg p-8 bg-white">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">INVOICE</h1>
            <p className="text-gray-500 mt-1">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">Evara</h2>
            <p className="text-sm text-gray-500">123 Commerce St</p>
            <p className="text-sm text-gray-500">Seattle, WA 98101</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-500 text-sm uppercase mb-2">Bill To</h3>
            <p className="font-semibold">{invoice.order.user.name || 'Customer'}</p>
            <p className="text-sm">{invoice.order.user.email}</p>
            <p className="text-sm">{invoice.order.shippingAddress.addressLine1}</p>
            <p className="text-sm">{invoice.order.shippingAddress.city}, {invoice.order.shippingAddress.state} {invoice.order.shippingAddress.zipCode}</p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-gray-500 text-sm uppercase mb-2">Invoice Details</h3>
            <p className="text-sm">Order: #{invoice.order.orderNumber.slice(-8)}</p>
            <p className="text-sm">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p className="text-sm">Shipping: {invoice.order.shippingMethod}</p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2">Item</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{item.title}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">${Number(item.price).toFixed(2)}</td>
                <td className="py-2 text-right">${(Number(item.price) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-1"><span>Subtotal:</span><span>${Number(invoice.subtotal).toFixed(2)}</span></div>
            <div className="flex justify-between py-1"><span>Shipping:</span><span>${Number(invoice.shipping).toFixed(2)}</span></div>
            <div className="flex justify-between py-1"><span>Tax:</span><span>${Number(invoice.tax).toFixed(2)}</span></div>
            <div className="flex justify-between py-2 border-t-2 font-bold text-lg">
              <span>Total:</span><span>${Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-400">
          Thank you for your purchase!
        </div>
      </div>
    </div>
  );
}
