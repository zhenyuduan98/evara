'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EVENT_TYPES = ['WEDDING', 'BIRTHDAY', 'BABY_SHOWER', 'HOLIDAY', 'HOUSEWARMING', 'OTHER'];

interface Registry {
  id: string;
  name: string;
  eventType: string;
  eventDate: string | null;
  description: string | null;
  shareCode: string;
  items: { id: string }[];
  createdAt: string;
}

export default function GiftRegistryPage() {
  const router = useRouter();
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('WEDDING');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gift-registry')
      .then((r) => r.json())
      .then(setRegistries)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/gift-registry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, eventType, eventDate: eventDate || null, description: description || null }),
    });
    if (res.ok) {
      const registry = await res.json();
      router.push(`/gift-registry/${registry.id}`);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎁 Gift Registries</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create Registry'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded p-6 mb-6 space-y-4">
          <div>
            <label className="block font-medium mb-1">Registry Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Event Type</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full border rounded px-3 py-2">
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Event Date (optional)</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Create</button>
        </form>
      )}

      {registries.length === 0 ? (
        <p className="text-gray-500">No registries yet. Create one to get started!</p>
      ) : (
        <div className="space-y-4">
          {registries.map((r) => (
            <Link key={r.id} href={`/gift-registry/${r.id}`} className="block border rounded p-4 hover:bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{r.name}</h2>
                  <p className="text-sm text-gray-500">{r.eventType.replace('_', ' ')} • {r.items.length} items</p>
                  {r.eventDate && <p className="text-sm text-gray-400">Date: {new Date(r.eventDate).toLocaleDateString()}</p>}
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
