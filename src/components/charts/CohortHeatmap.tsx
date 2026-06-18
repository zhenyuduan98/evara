'use client';

import { useEffect, useState } from 'react';

interface CohortData {
  cohortMonth: string;
  totalUsers: number;
  retention: Record<string, { users: number; percent: number }>;
}

export default function CohortHeatmap() {
  const [cohorts, setCohorts] = useState<CohortData[]>([]);

  useEffect(() => {
    fetch('/api/admin/analytics/cohorts?months=6')
      .then(r => r.json())
      .then(d => setCohorts(d.cohorts || []));
  }, []);

  if (cohorts.length === 0) {
    return <p className="text-gray-500 text-center py-8">No cohort data available.</p>;
  }

  const maxOffset = Math.max(...cohorts.flatMap(c => Object.keys(c.retention).map(Number)), 0);
  const offsets = Array.from({ length: maxOffset + 1 }, (_, i) => i);

  const getColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-600 text-white';
    if (percent >= 60) return 'bg-green-500 text-white';
    if (percent >= 40) return 'bg-green-400 text-white';
    if (percent >= 20) return 'bg-green-300 text-gray-800';
    if (percent > 0) return 'bg-green-200 text-gray-800';
    return 'bg-gray-100 text-gray-400';
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-sm w-full">
        <thead>
          <tr>
            <th className="py-2 px-3 text-left">Cohort</th>
            <th className="py-2 px-3 text-right">Users</th>
            {offsets.map(o => (
              <th key={o} className="py-2 px-3 text-center">M{o}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map(c => (
            <tr key={c.cohortMonth}>
              <td className="py-1 px-3 font-medium">{c.cohortMonth}</td>
              <td className="py-1 px-3 text-right">{c.totalUsers}</td>
              {offsets.map(o => {
                const data = c.retention[String(o)];
                const percent = data?.percent || 0;
                return (
                  <td key={o} className={`py-1 px-3 text-center rounded ${getColor(percent)}`} title={`${data?.users || 0} users (${percent}%)`}>
                    {percent > 0 ? `${percent}%` : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
