import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const currencies = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'CNY', symbol: '¥', rate: 7.24 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'JPY', symbol: '¥', rate: 149.5 },
] as const;

export type CurrencyCode = (typeof currencies)[number]['code'];

export function convertCurrency(amountUSD: number, targetCode: CurrencyCode): number {
  const currency = currencies.find(c => c.code === targetCode);
  if (!currency) return amountUSD;
  return Math.round(amountUSD * currency.rate * 100) / 100;
}

export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const currency = currencies.find(c => c.code === currencyCode);
  if (!currency) return `$${amount.toFixed(2)}`;
  return `${currency.symbol}${amount.toFixed(2)}`;
}

export default getRequestConfig(async () => {
  const locale = defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
