export type Locale = 'en' | 'zh' | 'ja' | 'es' | 'fr';

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export async function getMessages(locale: string = 'en') {
  const validLocale = LOCALES.find(l => l.code === locale) ? locale : 'en';
  try {
    return (await import(`../../messages/${validLocale}.json`)).default;
  } catch {
    return (await import('../../messages/en.json')).default;
  }
}

export function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
  return (match?.[1] as Locale) || 'en';
}

export function getCurrencyFromCookie(): string {
  if (typeof document === 'undefined') return 'USD';
  const match = document.cookie.match(/(?:^|; )currency=([^;]*)/);
  return match?.[1] || 'USD';
}
