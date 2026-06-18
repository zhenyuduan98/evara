'use client';

export default function LightningDealBar({ claimed, max }: { claimed: number; max: number }) {
  const pct = Math.min(100, Math.round((claimed / max) * 100));
  const color = pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-orange-400' : 'bg-green-500';

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-600 mt-1">
        {pct}% claimed
        {pct >= 80 && <span className="text-red-600 font-semibold ml-1">Almost gone!</span>}
      </p>
    </div>
  );
}
