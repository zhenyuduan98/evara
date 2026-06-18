'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getLocaleFromCookie, getCurrencyFromCookie, type Locale } from '@/lib/i18n';
import { type CurrencyCode } from '@/lib/currency';

type Messages = Record<string, Record<string, string>>;

interface IntlContextType {
  locale: Locale;
  currency: CurrencyCode;
  messages: Messages;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: CurrencyCode) => void;
}

const IntlContext = createContext<IntlContextType | null>(null);

export function useIntl() {
  const ctx = useContext(IntlContext);
  if (!ctx) throw new Error('useIntl must be used within IntlProvider');
  return ctx;
}

export default function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [messages, setMessages] = useState<Messages>({});

  const loadMessages = useCallback(async (loc: Locale) => {
    try {
      const msgs = (await import(`../../messages/${loc}.json`)).default;
      setMessages(msgs);
    } catch {
      const msgs = (await import('../../messages/en.json')).default;
      setMessages(msgs);
    }
  }, []);

  useEffect(() => {
    const loc = getLocaleFromCookie();
    const cur = getCurrencyFromCookie() as CurrencyCode;
    setLocaleState(loc);
    setCurrencyState(cur);
    loadMessages(loc);
  }, [loadMessages]);

  const setLocale = (loc: Locale) => {
    document.cookie = `locale=${loc};path=/;max-age=31536000`;
    setLocaleState(loc);
    loadMessages(loc);
  };

  const setCurrency = (cur: CurrencyCode) => {
    document.cookie = `currency=${cur};path=/;max-age=31536000`;
    setCurrencyState(cur);
  };

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const [ns, k] = key.split('.');
    let value = messages[ns]?.[k] || key;
    if (params) {
      Object.entries(params).forEach(([pk, pv]) => {
        value = value.replace(`{${pk}}`, String(pv));
      });
    }
    return value;
  }, [messages]);

  return (
    <IntlContext.Provider value={{ locale, currency, messages, t, setLocale, setCurrency }}>
      {children}
    </IntlContext.Provider>
  );
}
