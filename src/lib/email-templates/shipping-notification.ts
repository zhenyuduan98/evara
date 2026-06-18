export interface ShippingNotificationData {
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl?: string;
  carrier: string;
  estimatedDelivery: string;
  items: { title: string; quantity: number }[];
}

export function shippingNotificationTemplate(data: ShippingNotificationData): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Shipping Notification</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5;">
  <div style="background:#232f3e;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:24px;">Your Order Has Shipped! 🚚</h1>
  </div>
  <div style="background:white;padding:30px;border-radius:0 0 8px 8px;">
    <p>Hi ${data.customerName},</p>
    <p>Great news! Your order <strong>#${data.orderNumber}</strong> is on its way.</p>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:20px;border-radius:8px;margin:20px 0;">
      <p style="margin:0 0 8px;"><strong>Carrier:</strong> ${data.carrier}</p>
      <p style="margin:0 0 8px;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      <p style="margin:0;font-size:18px;font-weight:bold;color:#1d4ed8;">📅 Estimated Delivery: ${data.estimatedDelivery}</p>
      ${data.trackingUrl ? `<div style="text-align:center;margin-top:15px;">
        <a href="${data.trackingUrl}" style="background:#f59e0b;color:black;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Track Package</a>
      </div>` : ''}
    </div>

    <h3>Items in this shipment:</h3>
    <ul style="padding-left:20px;">
      ${data.items.map(i => `<li style="margin:4px 0;">${i.title} × ${i.quantity}</li>`).join('')}
    </ul>

    <p style="color:#6b7280;font-size:14px;">You'll receive a notification when your package is delivered.</p>
  </div>
</body></html>`;
}
