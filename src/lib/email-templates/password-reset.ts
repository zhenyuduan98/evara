export interface PasswordResetData {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

export function passwordResetTemplate(data: PasswordResetData): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Password Reset</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5;">
  <div style="background:#232f3e;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:24px;">Password Reset Request 🔒</h1>
  </div>
  <div style="background:white;padding:30px;border-radius:0 0 8px 8px;">
    <p>Hi ${data.name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>

    <div style="text-align:center;margin:30px 0;">
      <a href="${data.resetUrl}" style="background:#f59e0b;color:black;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">Reset Password</a>
    </div>

    <p style="color:#6b7280;font-size:14px;">This link expires in ${data.expiresIn}.</p>
    <p style="color:#6b7280;font-size:14px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>

    <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;">If the button doesn't work, copy and paste this URL:<br>${data.resetUrl}</p>
    </div>
  </div>
</body></html>`;
}
