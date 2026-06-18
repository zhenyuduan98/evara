'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = (off: number) => {
    setLoading(true);
    fetch(`/api/notifications?limit=${limit}&offset=${off}`)
      .then(r => r.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(offset); }, [offset]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <Link href="/account/notification-settings" className="text-sm text-blue-600 hover:underline">
          Settings
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-lg border ${!n.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{n.type}</span>
                    {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <h3 className="font-semibold mt-1">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{n.body}</p>
                  {n.link && (
                    <Link href={n.link} className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                      View Details →
                    </Link>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</p>
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="text-xs text-blue-600 hover:underline mt-1">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > limit && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="py-2 text-sm text-gray-500">
            {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
