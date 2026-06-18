'use client';

import { useState } from 'react';
const templateConfigs = [
  {
    name: 'Order Confirmation',
    key: 'order-confirmation',
    getHtml: async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email-templates/order-confirmation');
      return orderConfirmationTemplate({
        customerName: 'John Doe',
        orderNumber: 'ORD-20240115-ABC123',
        items: [
          { title: 'Wireless Bluetooth Headphones', quantity: 1, price: '49.99', image: '' },
          { title: 'USB-C Charging Cable (3-pack)', quantity: 2, price: '12.99' },
        ],
        subtotal: '75.97',
        shipping: '5.99',
        tax: '6.08',
        total: '88.04',
        shippingAddress: { name: 'John Doe', street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
      });
    },
  },
  {
    name: 'Shipping Notification',
    key: 'shipping-notification',
    getHtml: async () => {
      const { shippingNotificationTemplate } = await import('@/lib/email-templates/shipping-notification');
      return shippingNotificationTemplate({
        customerName: 'John Doe',
        orderNumber: 'ORD-20240115-ABC123',
        trackingNumber: '1Z999AA10123456784',
        trackingUrl: 'https://example.com/track/1Z999AA10123456784',
        carrier: 'UPS',
        estimatedDelivery: 'January 20, 2024',
        items: [
          { title: 'Wireless Bluetooth Headphones', quantity: 1 },
          { title: 'USB-C Charging Cable (3-pack)', quantity: 2 },
        ],
      });
    },
  },
  {
    name: 'Refund Confirmation',
    key: 'refund-confirmation',
    getHtml: async () => {
      const { refundConfirmationTemplate } = await import('@/lib/email-templates/refund-confirmation');
      return refundConfirmationTemplate({
        customerName: 'John Doe',
        orderNumber: 'ORD-20240115-ABC123',
        refundAmount: '49.99',
        refundMethod: 'Visa ending in 4242',
        items: [{ title: 'Wireless Bluetooth Headphones', quantity: 1, price: '49.99' }],
        reason: 'Item defective',
      });
    },
  },
  {
    name: 'Welcome',
    key: 'welcome',
    getHtml: async () => {
      const { welcomeTemplate } = await import('@/lib/email-templates/welcome');
      return welcomeTemplate({ name: 'John Doe' });
    },
  },
  {
    name: 'Password Reset',
    key: 'password-reset',
    getHtml: async () => {
      const { passwordResetTemplate } = await import('@/lib/email-templates/password-reset');
      return passwordResetTemplate({
        name: 'John Doe',
        resetUrl: 'https://example.com/auth/reset-password?token=abc123',
        expiresIn: '1 hour',
      });
    },
  },
];

export default function EmailTemplatesPage() {
  const [selected, setSelected] = useState(templateConfigs[0].key);
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const template = templateConfigs.find(t => t.key === selected)!;

  // Load template HTML
  useState(() => {
    template.getHtml().then(h => { setHtml(h); setLoading(false); });
  });

  const handleSelect = async (key: string) => {
    setSelected(key);
    setLoading(true);
    const t = templateConfigs.find(t => t.key === key)!;
    const h = await t.getHtml();
    setHtml(h);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Email Templates Preview</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {templateConfigs.map(t => (
          <button
            key={t.key}
            onClick={() => handleSelect(t.key)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              selected === t.key ? 'bg-yellow-400 text-black' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden bg-gray-100">
        <div className="bg-gray-200 px-4 py-2 text-sm font-medium text-gray-600">
          Preview: {template.name}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-96 text-gray-500">Loading template...</div>
        ) : (
          <iframe
            srcDoc={html}
            className="w-full bg-white"
            style={{ height: '700px', border: 'none' }}
            title={`Email preview: ${template.name}`}
          />
        )}
      </div>
    </div>
  );
}
