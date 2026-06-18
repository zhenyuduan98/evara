const baseLayout = (content: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:0;padding:0;background:#f3f4f6}
.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden}
.header{background:#131921;color:#fff;padding:20px;text-align:center;font-size:24px;font-weight:bold}
.body{padding:24px}.footer{background:#f9fafb;padding:16px;text-align:center;color:#6b7280;font-size:12px}
.btn{display:inline-block;background:#f0c14b;color:#111;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold}
table{width:100%;border-collapse:collapse}td,th{padding:8px;text-align:left;border-bottom:1px solid #e5e7eb}
</style></head><body><div class="container">
<div class="header">Evara</div>
<div class="body">${content}</div>
<div class="footer">&copy; ${new Date().getFullYear()} Evara. All rights reserved.</div>
</div></body></html>`;

export function welcomeEmail(name: string): string {
  return baseLayout(`
    <h2>Welcome, ${name}!</h2>
    <p>Thanks for creating an account. Start shopping our amazing deals today.</p>
    <p style="text-align:center"><a href="${process.env.NEXTAUTH_URL}" class="btn">Start Shopping</a></p>
  `);
}

interface OrderItem { title: string; quantity: number; price: string; }

export function orderConfirmationEmail(orderNumber: string, items: OrderItem[], total: string): string {
  const rows = items.map(i => `<tr><td>${i.title}</td><td>${i.quantity}</td><td>${i.price}</td></tr>`).join('');
  return baseLayout(`
    <h2>Order Confirmed!</h2>
    <p>Your order <strong>#${orderNumber}</strong> has been placed successfully.</p>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>
    <p style="text-align:right;font-size:18px"><strong>Total: ${total}</strong></p>
    <p style="text-align:center"><a href="${process.env.NEXTAUTH_URL}/account/orders" class="btn">View Order</a></p>
  `);
}

export function shippingConfirmationEmail(orderNumber: string, trackingNumber?: string): string {
  return baseLayout(`
    <h2>Your Order Has Shipped!</h2>
    <p>Order <strong>#${orderNumber}</strong> is on its way.</p>
    ${trackingNumber ? `<p>Tracking number: <strong>${trackingNumber}</strong></p>` : ''}
    <p style="text-align:center"><a href="${process.env.NEXTAUTH_URL}/account/orders" class="btn">Track Order</a></p>
  `);
}

export function passwordResetEmail(resetUrl: string): string {
  return baseLayout(`
    <h2>Reset Your Password</h2>
    <p>Click the button below to reset your password. This link expires in 1 hour.</p>
    <p style="text-align:center"><a href="${resetUrl}" class="btn">Reset Password</a></p>
    <p style="color:#6b7280;font-size:12px">If you didn't request this, ignore this email.</p>
  `);
}
