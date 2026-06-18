'use client';

import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  bars: { key: string; color?: string; name?: string }[];
  height?: number;
}

export default function BarChart({ data, xKey, bars, height = 300 }: BarChartProps) {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars.map((bar, i) => (
          <Bar key={bar.key} dataKey={bar.key} fill={bar.color || colors[i % colors.length]} name={bar.name || bar.key} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
