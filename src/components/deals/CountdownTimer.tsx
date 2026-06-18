'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const left = getTimeLeft(endDate);
      setTimeLeft(left);
      if (left.total <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.total <= 0) {
    return <span className="text-red-600 font-semibold text-sm">Ended</span>;
  }

  return (
    <div className="flex gap-1 items-center">
      <span className="text-xs text-gray-500 mr-1">Ends in:</span>
      {timeLeft.days > 0 && (
        <TimeBox value={timeLeft.days} label="d" />
      )}
      <TimeBox value={timeLeft.hours} label="h" />
      <TimeBox value={timeLeft.minutes} label="m" />
      <TimeBox value={timeLeft.seconds} label="s" />
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <span className="bg-gray-900 text-white text-xs font-mono px-1.5 py-0.5 rounded">
      {String(value).padStart(2, '0')}{label}
    </span>
  );
}

function getTimeLeft(endDate: string) {
  const total = new Date(endDate).getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
