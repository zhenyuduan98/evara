export interface RefundConfirmationData {
  customerName: string;
  orderNumber: string;
  refundAmount: string;
  refundMethod: string;
  items: { title: string; quantity: number; price: string }[];
  reason?: string;
}

export function refundConfirmationTemplate(data: RefundConfirmationData): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Refund Confirmation</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5;">
  <div style="background:#232f3e;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:24px;">Refund Confirmed 💰</h1>
  </div>
  <div style="background:white;padding:30px;border-radius:0 0 8px 8px;">
    <p>Hi ${data.customerName},</p>
    <p>We've processed a refund for your order <strong>#${data.orderNumber}</strong>.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:20px 0;text-align:center;">
      <p style="margin:0;font-size:14px;color:#6b7280;">Refund Amount</p>
      <p style="margin:8px 0 0;font-size:32px;font-weight:bold;color:#16a34a;">$${data.refundAmount}</p>
    </div>

    <p><strong>Refund Method:</strong> ${data.refundMethod}</p>
    ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}

    <h3>Refunded Items:</h3>
    <ul style="padding-left:20px;">
      ${data.items.map(i => `<li style="margin:4px 0;">${i.title} × ${i.quantity} — $${i.price}</li>`).join('')}
    </ul>

    <p style="color:#6b7280;font-size:14px;">Refunds typically take 5–10 business days to appear on your statement.</p>

    <div style="text-align:center;margin:20px 0;">
      <a href="/account/orders" style="background:#f59e0b;color:black;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">View Orders</a>
    </div>
  </div>
</body></html>`;
}
