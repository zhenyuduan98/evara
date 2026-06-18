// Order status change email notification templates

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: string;
  items: { title: string; quantity: number; price: string }[];
  shippingAddress?: string;
  trackingNumber?: string;
}

export function getOrderStatusEmailSubject(status: string, orderNumber: string): string {
  const subjects: Record<string, string> = {
    CONFIRMED: `Order Confirmed - #${orderNumber}`,
    PROCESSING: `Your Order is Being Prepared - #${orderNumber}`,
    SHIPPED: `Your Order Has Shipped! - #${orderNumber}`,
    DELIVERED: `Your Order Has Been Delivered - #${orderNumber}`,
    CANCELLED: `Order Cancelled - #${orderNumber}`,
    REFUNDED: `Order Refunded - #${orderNumber}`,
  };
  return subjects[status] || `Order Update - #${orderNumber}`;
}

export function getOrderConfirmedTemplate(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmed</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: #232f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Order Confirmed ✓</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Hi ${data.customerName},</p>
    <p>Thank you for your order! We've received your order <strong>#${data.orderNumber}</strong> and it's being processed.</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px;">Order Summary</h3>
      ${data.items.map(item => `<p style="margin: 5px 0;">${item.title} × ${item.quantity} — $${item.price}</p>`).join('')}
      <hr style="border: none; border-top: 1px solid #d1d5db; margin: 10px 0;">
      <p style="font-weight: bold; font-size: 18px;">Total: $${data.total}</p>
    </div>
    <p style="color: #6b7280; font-size: 14px;">We'll send you another email when your order ships.</p>
  </div>
</body>
</html>`;
}

export function getOrderShippedTemplate(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Shipped</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: #232f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Your Order Has Shipped! 🚚</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Hi ${data.customerName},</p>
    <p>Great news! Your order <strong>#${data.orderNumber}</strong> is on its way.</p>
    ${data.trackingNumber ? `
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
    </div>` : ''}
    ${data.shippingAddress ? `<p><strong>Shipping to:</strong> ${data.shippingAddress}</p>` : ''}
    <p style="color: #6b7280; font-size: 14px;">You'll receive a notification when your package is delivered.</p>
  </div>
</body>
</html>`;
}

export function getOrderDeliveredTemplate(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Delivered</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: #232f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Your Order Has Been Delivered 📦</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Hi ${data.customerName},</p>
    <p>Your order <strong>#${data.orderNumber}</strong> has been delivered!</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="/account/orders" style="background: #f59e0b; color: black; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Review Your Purchase</a>
    </div>
    <p style="color: #6b7280; font-size: 14px;">Need to return an item? Visit your orders page.</p>
  </div>
</body>
</html>`;
}

export function getOrderCancelledTemplate(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Cancelled</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Order Cancelled</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Hi ${data.customerName},</p>
    <p>Your order <strong>#${data.orderNumber}</strong> has been cancelled.</p>
    <p>If a payment was made, a refund of <strong>$${data.total}</strong> will be processed within 5-10 business days.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="/" style="background: #f59e0b; color: black; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Continue Shopping</a>
    </div>
  </div>
</body>
</html>`;
}

export function getOrderStatusEmailTemplate(data: OrderEmailData): string {
  switch (data.status) {
    case 'CONFIRMED': return getOrderConfirmedTemplate(data);
    case 'SHIPPED': return getOrderShippedTemplate(data);
    case 'DELIVERED': return getOrderDeliveredTemplate(data);
    case 'CANCELLED': return getOrderCancelledTemplate(data);
    default: return getOrderConfirmedTemplate(data);
  }
}
