'use client';

import { useState } from 'react';
import { locales, currencies, type CurrencyCode } from '@/i18n';

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState('en');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [open, setOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    setOpen(false);
    window.location.reload();
  };

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    document.cookie = `currency=${code};path=/;max-age=31536000`;
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-white text-sm hover:text-amazon-orange px-2 py-1"
      >
        <span className="text-xs">🌐</span>
        <span>{locale.toUpperCase()}</span>
        <span className="text-gray-400">|</span>
        <span>{currency}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded shadow-lg z-50 min-w-[160px] border">
          <div className="p-2 border-b">
            <p className="text-xs text-gray-500 font-semibold mb-1">Language</p>
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => handleLocaleChange(l)}
                className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${locale === l ? 'font-bold text-amazon-orange' : 'text-gray-700'}`}
              >
                {l === 'en' ? '🇺🇸 English' : '🇨🇳 中文'}
              </button>
            ))}
          </div>
          <div className="p-2">
            <p className="text-xs text-gray-500 font-semibold mb-1">Currency</p>
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCurrencyChange(c.code as CurrencyCode)}
                className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${currency === c.code ? 'font-bold text-amazon-orange' : 'text-gray-700'}`}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
