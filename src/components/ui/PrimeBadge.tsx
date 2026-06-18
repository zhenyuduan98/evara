'use client';

export default function PrimeBadge({ tier }: { tier?: string }) {
  if (!tier || tier === 'FREE') return null;

  return (
    <span className="inline-flex items-center bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
      {tier === 'PRIME_PLUS' ? 'PRIME+' : 'PRIME'}
    </span>
  );
}
