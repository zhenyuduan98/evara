export type CurrencyCode = 'USD' | 'CNY' | 'JPY' | 'EUR' | 'GBP';

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  CNY: 7.24,
  JPY: 149.5,
  EUR: 0.92,
  GBP: 0.79,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  CNY: '¥',
  JPY: '¥',
  EUR: '€',
  GBP: '£',
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: 'USD ($)',
  CNY: 'CNY (¥)',
  JPY: 'JPY (¥)',
  EUR: 'EUR (€)',
  GBP: 'GBP (£)',
};

export function convertPrice(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const inUSD = amount / EXCHANGE_RATES[from];
  return inUSD * EXCHANGE_RATES[to];
}

export function formatPrice(amount: number, currency: CurrencyCode = 'USD'): string {
  const decimals = currency === 'JPY' ? 0 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
