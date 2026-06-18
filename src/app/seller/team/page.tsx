'use client';

import { useState, useEffect } from 'react';

export default function SellerTeamPage() {
  const [members, setMembers] = useState<Array<{ id: string; userId: string; role: string; invitedAt: string; acceptedAt?: string }>>([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTeam(); }, []);

  async function fetchTeam() {
    const res = await fetch('/api/seller/team');
    if (res.ok) { const data = await res.json(); setMembers(data.members || []); }
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/seller/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) });
    setUserId('');
    await fetchTeam();
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Team Management</h1>
      <form onSubmit={invite} className="flex gap-3 mb-8">
        <input value={userId} onChange={e => setUserId(e.target.value)} className="border rounded p-2 flex-1" placeholder="User ID to invite" required />
        <select value={role} onChange={e => setRole(e.target.value)} className="border rounded p-2">
          <option value="ADMIN">Admin</option>
          <option value="EDITOR">Editor</option>
          <option value="VIEWER">Viewer</option>
        </select>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">Invite</button>
      </form>
      <table className="w-full border-collapse">
        <thead><tr className="border-b"><th className="text-left p-2">User ID</th><th className="text-left p-2">Role</th><th className="text-left p-2">Invited</th><th className="text-left p-2">Accepted</th></tr></thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id} className="border-b"><td className="p-2 font-mono text-sm">{m.userId}</td><td className="p-2">{m.role}</td><td className="p-2">{new Date(m.invitedAt).toLocaleDateString()}</td><td className="p-2">{m.acceptedAt ? new Date(m.acceptedAt).toLocaleDateString() : 'Pending'}</td></tr>
          ))}
        </tbody>
      </table>
      {members.length === 0 && <p className="text-gray-500 mt-4">No team members yet.</p>}
    </div>
  );
}
