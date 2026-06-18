'use client';

import { useState, useRef, useEffect } from 'react';
import { LOCALES, type Locale } from '@/lib/i18n';
import { useIntl } from '@/providers/IntlProvider';

export default function LocaleSwitcher() {
  const { locale, setLocale } = useIntl();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find(l => l.code === locale) || LOCALES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 border border-transparent hover:border-white rounded px-2 py-1 text-white text-sm"
        aria-label="Switch language"
      >
        <span>{current.flag}</span>
        <span className="font-bold">{current.code.toUpperCase()}</span>
        <span className="text-xs">▼</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded shadow-lg border dark:border-gray-700 z-50 min-w-[150px]">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code as Locale); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                l.code === locale ? 'bg-gray-100 dark:bg-gray-700 font-bold' : ''
              } text-gray-900 dark:text-gray-100`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
