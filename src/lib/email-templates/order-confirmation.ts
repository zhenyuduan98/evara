const baseStyle = `font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;`;
const headerStyle = `background: #232f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;`;
const bodyStyle = `background: white; padding: 30px; border-radius: 0 0 8px 8px;`;
const btnStyle = `background: #f59e0b; color: black; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;`;

export interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  items: { title: string; quantity: number; price: string; image?: string }[];
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: { name: string; street: string; city: string; state: string; zip: string; country: string };
}

export function orderConfirmationTemplate(data: OrderConfirmationData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        ${item.image ? `<img src="${item.image}" alt="" style="width:50px;height:50px;object-fit:cover;border-radius:4px;" />` : ''}
        ${item.title}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price}</td>
    </tr>`).join('');

  const addr = data.shippingAddress;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="${baseStyle}">
  <div style="${headerStyle}"><h1 style="margin:0;font-size:24px;">Order Confirmed ✓</h1></div>
  <div style="${bodyStyle}">
    <p>Hi ${data.customerName},</p>
    <p>Thank you for your order! Your order <strong>#${data.orderNumber}</strong> has been confirmed.</p>
    
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:10px;text-align:left;border-bottom:2px solid #e5e7eb;">Item</th>
        <th style="padding:10px;text-align:center;border-bottom:2px solid #e5e7eb;">Qty</th>
        <th style="padding:10px;text-align:right;border-bottom:2px solid #e5e7eb;">Price</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="text-align:right;margin:20px 0;">
      <p style="margin:4px 0;">Subtotal: $${data.subtotal}</p>
      <p style="margin:4px 0;">Shipping: $${data.shipping}</p>
      <p style="margin:4px 0;">Tax: $${data.tax}</p>
      <p style="margin:4px 0;font-size:18px;font-weight:bold;">Total: $${data.total}</p>
    </div>

    <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:20px 0;">
      <h3 style="margin:0 0 8px;">Shipping Address</h3>
      <p style="margin:0;">${addr.name}<br>${addr.street}<br>${addr.city}, ${addr.state} ${addr.zip}<br>${addr.country}</p>
    </div>

    <div style="text-align:center;margin:20px 0;">
      <a href="/account/orders" style="${btnStyle}">View Order</a>
    </div>
  </div>
</body></html>`;
}
