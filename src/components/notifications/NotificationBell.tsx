'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  category?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchInitial = useCallback(() => {
    fetch('/api/notifications?limit=10')
      .then(r => r.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }, []);

  // Initial fetch
  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  // SSE for real-time updates
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/notifications/stream');
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init') {
            setUnreadCount(data.unreadCount);
          } else if (data.type === 'new' && data.notifications) {
            setNotifications(prev => {
              const newIds = new Set(data.notifications.map((n: Notification) => n.id));
              const filtered = prev.filter(n => !newIds.has(n.id));
              return [...data.notifications, ...filtered].slice(0, 20);
            });
            setUnreadCount(data.unreadCount);
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        // Reconnect handled by browser EventSource automatically
      };
    } catch {
      // SSE not supported, fall back to polling
    }

    return () => {
      es?.close();
      eventSourceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const categoryIcon = (cat?: string) => {
    switch (cat) {
      case 'order': return '📦';
      case 'promo': return '🏷️';
      case 'system': return '⚙️';
      case 'social': return '👥';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center border border-transparent hover:border-white rounded p-1 text-white relative"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-96 bg-white text-black rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-bold text-sm">Notifications</h3>
            <Link href="/account/notifications" className="text-xs text-blue-600 hover:underline" onClick={() => setOpen(false)}>
              View All
            </Link>
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm p-4 text-center">No notifications</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                  onClick={() => { if (!n.read) markAsRead(n.id); }}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold">
                      <span className="mr-1">{categoryIcon(n.category)}</span>
                      {n.title}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{n.body}</p>
                  {n.link && (
                    <Link href={n.link} className="text-xs text-blue-600 hover:underline mt-1 inline-block" onClick={() => setOpen(false)}>
                      View →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
