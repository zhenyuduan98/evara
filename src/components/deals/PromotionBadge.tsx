'use client';

export default function PromotionBadge({ type, value }: { type: string; value: number }) {
  const labels: Record<string, string> = {
    FLASH_SALE: `⚡ ${value}% OFF`,
    LIGHTNING_DEAL: `🔥 ${value}% OFF`,
    BUY_X_GET_Y: '🎁 BOGO',
    PERCENTAGE: `${value}% OFF`,
    FIXED: `$${value} OFF`,
  };

  const colors: Record<string, string> = {
    FLASH_SALE: 'bg-red-600',
    LIGHTNING_DEAL: 'bg-orange-500',
    BUY_X_GET_Y: 'bg-purple-600',
    PERCENTAGE: 'bg-green-600',
    FIXED: 'bg-blue-600',
  };

  return (
    <span className={`${colors[type] || 'bg-gray-600'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>
      {labels[type] || `${value}% OFF`}
    </span>
  );
}
