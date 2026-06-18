'use client';

import { useState, useRef, useEffect } from 'react';
import { CURRENCY_LABELS, type CurrencyCode } from '@/lib/currency';
import { useIntl } from '@/providers/IntlProvider';

const CURRENCIES = Object.keys(CURRENCY_LABELS) as CurrencyCode[];

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useIntl();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        aria-label="Switch currency"
      >
        <span className="font-bold">{currency}</span>
        <span className="text-xs">▼</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded shadow-lg border dark:border-gray-700 z-50 min-w-[130px]">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCurrency(c); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                c === currency ? 'bg-gray-100 dark:bg-gray-700 font-bold' : ''
              } text-gray-900 dark:text-gray-100`}
            >
              {CURRENCY_LABELS[c]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
