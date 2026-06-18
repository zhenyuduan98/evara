'use client';

import { useState } from 'react';

const PLANS = [
  { months: 3, rate: 0.0, label: '3 months' },
  { months: 6, rate: 0.05, label: '6 months' },
  { months: 12, rate: 0.10, label: '12 months' },
];

export default function InstallmentCalculator({ price }: { price: number }) {
  const [selected, setSelected] = useState(0);

  if (price < 50) return null;

  const plan = PLANS[selected];
  const total = price * (1 + plan.rate);
  const monthly = Math.ceil((total / plan.months) * 100) / 100;
  const lowestMonthly = Math.ceil((price / 3) * 100) / 100;

  return (
    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 mt-4">
      <p className="text-sm font-medium text-blue-800 mb-2">
        💳 Pay as low as <span className="font-bold text-lg">${lowestMonthly.toFixed(2)}/mo</span> with installments
      </p>
      <div className="flex gap-2 mb-3">
        {PLANS.map((p, i) => (
          <button
            key={p.months}
            onClick={() => setSelected(i)}
            className={`px-3 py-1 rounded text-sm border ${selected === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-blue-400'}`}
          >
            {p.label}{p.rate === 0 ? ' (0% APR)' : ''}
          </button>
        ))}
      </div>
      <div className="text-sm text-gray-700 space-y-1">
        <p><span className="font-medium">${monthly.toFixed(2)}</span>/month × {plan.months} months</p>
        {plan.rate > 0 && <p className="text-xs text-gray-500">Total: ${total.toFixed(2)} ({(plan.rate * 100).toFixed(0)}% interest)</p>}
        {plan.rate === 0 && <p className="text-xs text-green-600 font-medium">0% interest - no extra cost!</p>}
      </div>
    </div>
  );
}
