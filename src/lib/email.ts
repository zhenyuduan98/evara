import { addEmailJob } from './queue';

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await addEmailJob(to, subject, html);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
  await sendEmail(
    email,
    'Reset Your Password',
    `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetUrl}" style="background:#f59e0b;color:#000;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">Reset Password</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    `,
  );
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
  await sendEmail(
    email,
    'Verify Your Email',
    `
    <h2>Email Verification</h2>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verifyUrl}" style="background:#f59e0b;color:#000;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">Verify Email</a></p>
    <p>This link expires in 24 hours.</p>
    `,
  );
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  total: number,
  itemCount: number,
): Promise<void> {
  await sendEmail(
    email,
    `Order Confirmation - ${orderNumber}`,
    `
    <h2>Order Confirmed!</h2>
    <p>Thank you for your order.</p>
    <p><strong>Order Number:</strong> ${orderNumber}</p>
    <p><strong>Items:</strong> ${itemCount}</p>
    <p><strong>Total:</strong> $${total.toFixed(2)}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders" style="background:#f59e0b;color:#000;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Order</a></p>
    `,
  );
}
