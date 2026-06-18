'use client';

import { useEffect, useState } from 'react';

interface Flag {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const load = () => fetch('/api/admin/feature-flags').then(r => r.json()).then(setFlags);
  useEffect(() => { load(); }, []);

  const toggle = async (flag: Flag) => {
    await fetch('/api/admin/feature-flags', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: flag.key, enabled: !flag.enabled }),
    });
    load();
  };

  const add = async () => {
    if (!newKey) return;
    await fetch('/api/admin/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: newKey, description: newDesc, enabled: false }),
    });
    setNewKey(''); setNewDesc(''); load();
  };

  const remove = async (key: string) => {
    await fetch('/api/admin/feature-flags', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Feature Flags</h1>
      <div className="flex gap-2 mb-6">
        <input className="border px-3 py-2 rounded" placeholder="Key" value={newKey} onChange={e => setNewKey(e.target.value)} />
        <input className="border px-3 py-2 rounded flex-1" placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={add}>Add</button>
      </div>
      <table className="w-full border-collapse">
        <thead><tr className="border-b"><th className="text-left p-2">Key</th><th className="text-left p-2">Description</th><th className="p-2">Enabled</th><th className="p-2">Actions</th></tr></thead>
        <tbody>
          {flags.map(f => (
            <tr key={f.id} className="border-b">
              <td className="p-2 font-mono text-sm">{f.key}</td>
              <td className="p-2">{f.description}</td>
              <td className="p-2 text-center">
                <button onClick={() => toggle(f)} className={`w-12 h-6 rounded-full relative ${f.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${f.enabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </td>
              <td className="p-2 text-center"><button onClick={() => remove(f.key)} className="text-red-500 text-sm">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
