export const locales = ['en', 'zh', 'es', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

import en from '@/messages/en.json';
import zh from '@/messages/zh.json';
import es from '@/messages/es.json';
import ja from '@/messages/ja.json';

const messages: Record<Locale, typeof en> = { en, zh, es, ja };

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T & string]: T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<typeof en>;

export function getMessages(locale: Locale) {
  return messages[locale] || messages.en;
}

export function t(locale: Locale, key: string): string {
  const msgs = getMessages(locale);
  const keys = key.split('.');
  let result: unknown = msgs;
  for (const k of keys) {
    if (result && typeof result === 'object') {
      result = (result as Record<string, unknown>)[k];
    } else return key;
  }
  return typeof result === 'string' ? result : key;
}
