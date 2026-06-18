export interface WelcomeEmailData {
  name: string;
}

export function welcomeTemplate(data: WelcomeEmailData): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Welcome</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5;">
  <div style="background:#232f3e;color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:28px;">Welcome to <span style="color:#f59e0b;">Evara</span>! 🎉</h1>
  </div>
  <div style="background:white;padding:30px;border-radius:0 0 8px 8px;">
    <p style="font-size:18px;">Hi ${data.name},</p>
    <p>We're excited to have you! Here's what you can do:</p>

    <div style="margin:20px 0;">
      <div style="display:flex;padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:24px;margin-right:12px;">🛒</span>
        <div><strong>Shop millions of products</strong><br><span style="color:#6b7280;font-size:14px;">Browse our extensive catalog</span></div>
      </div>
      <div style="display:flex;padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:24px;margin-right:12px;">⭐</span>
        <div><strong>Join Prime</strong><br><span style="color:#6b7280;font-size:14px;">Free shipping and exclusive deals</span></div>
      </div>
      <div style="display:flex;padding:12px 0;">
        <span style="font-size:24px;margin-right:12px;">📦</span>
        <div><strong>Track your orders</strong><br><span style="color:#6b7280;font-size:14px;">Real-time delivery updates</span></div>
      </div>
    </div>

    <div style="text-align:center;margin:30px 0;">
      <a href="/" style="background:#f59e0b;color:black;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">Start Shopping</a>
    </div>
  </div>
</body></html>`;
}
