'use client';

import { useEffect, useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'MAINTENANCE';
}

const typeStyles: Record<string, string> = {
  INFO: 'bg-blue-600 text-white',
  WARNING: 'bg-yellow-500 text-black',
  MAINTENANCE: 'bg-orange-600 text-white',
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/announcements/active')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div>
      {visible.map((a) => (
        <div key={a.id} className={`${typeStyles[a.type] || typeStyles.INFO} px-4 py-2 text-sm text-center relative`}>
          <strong>{a.title}</strong>: {a.content}
          <button
            onClick={() => setDismissed((s) => new Set(s).add(a.id))}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
