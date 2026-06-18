'use client';

import { useState, useEffect } from 'react';

interface SessionInfo {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/account/sessions')
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const revokeSession = async (id: string) => {
    const res = await fetch(`/api/account/sessions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Active Sessions</h1>
      {sessions.length === 0 ? (
        <p className="text-gray-500">No active sessions found.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{s.ip || 'Unknown IP'}</p>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {s.userAgent || 'Unknown device'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => revokeSession(s.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
