'use client';

import { useEffect, useState } from 'react';

interface PricePoint {
  id: string;
  price: number;
  changedAt: string;
}

export default function PriceHistoryChart({ productId }: { productId: string }) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${productId}/price-history`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) return <div className="h-48 bg-gray-50 rounded animate-pulse" />;
  if (data.length < 2) return null;

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  const W = 600;
  const H = 180;
  const PAD = 40;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;

  const points = data.map((d, i) => ({
    x: PAD + (i / (data.length - 1)) * chartW,
    y: PAD + chartH - ((d.price - minPrice) / range) * chartH,
    price: d.price,
    date: new Date(d.changedAt).toLocaleDateString(),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${PAD + chartH} L${points[0].x},${PAD + chartH} Z`;

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Price History (Last 30 Days)</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[600px] h-auto border rounded bg-white">
        {/* Y-axis labels */}
        <text x={PAD - 4} y={PAD + 4} textAnchor="end" className="text-[10px] fill-gray-500">${maxPrice.toFixed(2)}</text>
        <text x={PAD - 4} y={PAD + chartH + 4} textAnchor="end" className="text-[10px] fill-gray-500">${minPrice.toFixed(2)}</text>
        {/* X-axis labels */}
        <text x={PAD} y={H - 4} textAnchor="start" className="text-[10px] fill-gray-500">{points[0].date}</text>
        <text x={W - PAD} y={H - 4} textAnchor="end" className="text-[10px] fill-gray-500">{points[points.length - 1].date}</text>
        {/* Area fill */}
        <path d={areaD} fill="rgba(255,153,0,0.1)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="#FF9900" strokeWidth="2" />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FF9900">
            <title>{`${p.date}: $${p.price.toFixed(2)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-1 max-w-[600px]">
        <span>Low: ${minPrice.toFixed(2)}</span>
        <span>High: ${maxPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
