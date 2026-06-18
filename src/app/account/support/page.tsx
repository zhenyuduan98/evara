'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = ['General', 'Orders', 'Returns', 'Account', 'Technical', 'Billing'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'General', priority: 'MEDIUM', body: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets').then(r => r.json()).then(setTickets).finally(() => setLoading(false));
  }, []);

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const ticket = await res.json();
      setTickets(prev => [ticket, ...prev]);
      setShowForm(false);
      setForm({ subject: '', category: 'General', priority: 'MEDIUM', body: '' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded">
          {showForm ? 'Cancel' : 'New Ticket'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTicket} className="bg-white border rounded-lg p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required className="w-full border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded px-3 py-2">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full border rounded px-3 py-2">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={4} className="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded">Submit Ticket</button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-lg">
          <p className="text-gray-500 mb-2">No support tickets yet</p>
          <p className="text-sm text-gray-400">Create a ticket to get help from our team</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => (
            <Link key={t.id} href={`/account/support/${t.id}`} className="block bg-white border rounded-lg p-4 hover:shadow transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{t.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t.category} · {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[t.status] || ''}`}>{t.status.replace('_', ' ')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
