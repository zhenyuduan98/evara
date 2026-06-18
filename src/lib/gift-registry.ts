import { randomBytes } from 'crypto';

export function generateShareCode(): string {
  return randomBytes(6).toString('hex');
}
