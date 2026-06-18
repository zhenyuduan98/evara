import crypto from 'crypto';

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'captcha-secret-key-2024';

export function generateCaptcha(): { question: string; token: string } {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const answer = a + b;
  const question = `${a} + ${b} = ?`;
  const timestamp = Date.now();
  const token = crypto
    .createHmac('sha256', CAPTCHA_SECRET)
    .update(`${answer}:${timestamp}`)
    .digest('hex') + '.' + timestamp;
  return { question, token };
}

export function verifyCaptcha(answer: number, token: string): boolean {
  try {
    const [hash, tsStr] = token.split('.');
    const timestamp = parseInt(tsStr);
    // Expire after 5 minutes
    if (Date.now() - timestamp > 5 * 60 * 1000) return false;
    const expected = crypto
      .createHmac('sha256', CAPTCHA_SECRET)
      .update(`${answer}:${timestamp}`)
      .digest('hex');
    return hash === expected;
  } catch {
    return false;
  }
}
