'use client';

import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  lines: { key: string; color?: string; name?: string }[];
  height?: number;
}

export default function LineChart({ data, xKey, lines, height = 300 }: LineChartProps) {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map((line, i) => (
          <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color || colors[i % colors.length]} name={line.name || line.key} />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
