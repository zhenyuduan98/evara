'use client';

import { useState, useEffect } from 'react';

export default function SellerAPIKeysPage() {
  const [keys, setKeys] = useState<Array<{ id: string; name: string; key: string; isActive: boolean; lastUsedAt?: string; createdAt: string }>>([]);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchKeys(); }, []);

  async function fetchKeys() {
    const res = await fetch('/api/seller/api-keys');
    if (res.ok) { const data = await res.json(); setKeys(data.keys || []); }
  }

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/seller/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, permissions: { '*': true } }) });
    if (res.ok) { const data = await res.json(); setNewKey(data.apiKey.key); }
    setName('');
    await fetchKeys();
    setLoading(false);
  }

  async function revokeKey(id: string) {
    await fetch(`/api/seller/api-keys?id=${id}`, { method: 'DELETE' });
    await fetchKeys();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">API Keys</h1>

      {newKey && (
        <div className="bg-green-100 border border-green-300 p-4 rounded mb-6">
          <p className="font-medium">New API Key (copy now, won&apos;t be shown again):</p>
          <code className="block mt-2 bg-white p-2 rounded font-mono text-sm break-all">{newKey}</code>
          <button onClick={() => setNewKey('')} className="mt-2 text-sm text-green-700 underline">Dismiss</button>
        </div>
      )}

      <form onSubmit={createKey} className="flex gap-3 mb-8">
        <input value={name} onChange={e => setName(e.target.value)} className="border rounded p-2 flex-1" placeholder="Key name (e.g. Production)" required />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">Create Key</button>
      </form>

      <table className="w-full border-collapse">
        <thead><tr className="border-b"><th className="text-left p-2">Name</th><th className="text-left p-2">Key</th><th className="text-left p-2">Status</th><th className="text-left p-2">Last Used</th><th className="text-left p-2">Actions</th></tr></thead>
        <tbody>
          {keys.map(k => (
            <tr key={k.id} className="border-b">
              <td className="p-2">{k.name}</td>
              <td className="p-2 font-mono text-sm">{k.key}</td>
              <td className="p-2">{k.isActive ? <span className="text-green-600">Active</span> : <span className="text-red-600">Revoked</span>}</td>
              <td className="p-2">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}</td>
              <td className="p-2">{k.isActive && <button onClick={() => revokeKey(k.id)} className="text-red-600 hover:underline text-sm">Revoke</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {keys.length === 0 && <p className="text-gray-500 mt-4">No API keys yet.</p>}
    </div>
  );
}
