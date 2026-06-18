'use client';

import { useEffect, useState } from 'react';

interface Stream {
  id: string;
  title: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  scheduledAt: string;
  viewerCount: number;
}

export default function SellerLiveDashboard() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchStreams = () => {
    fetch('/api/live/streams')
      .then((r) => r.json())
      .then(setStreams)
      .catch(console.error);
  };

  useEffect(() => { fetchStreams(); }, []);

  const createStream = async () => {
    if (!title || !scheduledAt) return;
    setCreating(true);
    await fetch('/api/live/streams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: 'seller1', title, description, scheduledAt }),
    });
    setTitle('');
    setDescription('');
    setScheduledAt('');
    setCreating(false);
    fetchStreams();
  };

  const startStream = async (id: string) => {
    await fetch(`/api/live/streams/${id}/start`, { method: 'PATCH' });
    fetchStreams();
  };

  const endStream = async (id: string) => {
    await fetch(`/api/live/streams/${id}/end`, { method: 'PATCH' });
    fetchStreams();
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      LIVE: 'bg-red-600 text-white',
      SCHEDULED: 'bg-yellow-500 text-black',
      ENDED: 'bg-gray-500 text-white',
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📡 Manage Live Streams</h1>

      {/* Create form */}
      <div className="border rounded-lg p-6 mb-8 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Create New Stream</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Stream title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded px-3 py-2 md:col-span-2"
          />
        </div>
        <button
          onClick={createStream}
          disabled={creating || !title || !scheduledAt}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Stream'}
        </button>
      </div>

      {/* Stream list */}
      <div className="space-y-4">
        {streams.map((s) => (
          <div key={s.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {statusBadge(s.status)}
                <span className="font-medium">{s.title}</span>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(s.scheduledAt).toLocaleString()} · {s.viewerCount} viewers
              </p>
            </div>
            <div className="flex gap-2">
              {s.status === 'SCHEDULED' && (
                <button
                  onClick={() => startStream(s.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                  Go Live
                </button>
              )}
              {s.status === 'LIVE' && (
                <button
                  onClick={() => endStream(s.id)}
                  className="bg-gray-600 text-white px-4 py-2 rounded text-sm"
                >
                  End Stream
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
