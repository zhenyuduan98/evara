'use client';

import { useState, useEffect } from 'react';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    const url = filter ? `/api/tickets?status=${filter}` : '/api/tickets';
    fetch(url).then(r => r.json()).then(setTickets).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const selectTicket = async (id: string) => {
    const res = await fetch(`/api/tickets/${id}`);
    setSelected(await res.json());
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
    if (selected?.id === id) selectTicket(id);
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    await fetch(`/api/tickets/${selected.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: reply }),
    });
    setReply('');
    selectTicket(selected.id);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('')} className={`px-3 py-1 rounded text-sm ${!filter ? 'bg-yellow-400 font-semibold' : 'bg-white border'}`}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded text-sm ${filter === s ? 'bg-yellow-400 font-semibold' : 'bg-white border'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {loading ? <p className="text-gray-500">Loading...</p> : tickets.length === 0 ? (
            <p className="text-gray-500 bg-white p-6 rounded-lg border text-center">No tickets found</p>
          ) : tickets.map((t: any) => (
            <div key={t.id} onClick={() => selectTicket(t.id)}
              className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow transition ${selected?.id === t.id ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{t.subject}</h3>
                  <p className="text-xs text-gray-500 mt-1">{t.user?.name || t.user?.email} · {t.category}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[t.status] || ''}`}>{t.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>Priority: {t.priority}</span>
                <span>{t._count?.messages || 0} messages</span>
                <span>{new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</span>
                {t.assignedTo && <span className="text-blue-600">📋 Assigned</span>}
                {t.slaDeadline && (
                  <span className={new Date(t.slaDeadline) < new Date() ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    SLA: {new Date(t.slaDeadline).toLocaleDateString()}
                  </span>
                )}
                {t.csatScore && <span>⭐ {t.csatScore}/5</span>}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold">{selected.subject}</h3>
                <p className="text-sm text-gray-500">{selected.user?.name || selected.user?.email}</p>
              </div>
              <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)} className="text-sm border rounded px-2 py-1">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div className="flex gap-2 mb-4 items-center text-sm">
              <label className="text-gray-500">Assign to:</label>
              <input
                placeholder="Agent ID"
                defaultValue={selected.assignedTo || ''}
                onBlur={async (e) => {
                  await fetch(`/api/admin/tickets/${selected.id}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assignedTo: e.target.value || null }),
                  });
                  load();
                }}
                className="border rounded px-2 py-1 flex-1"
              />
              <label className="text-gray-500 ml-2">SLA:</label>
              <input
                type="date"
                defaultValue={selected.slaDeadline ? new Date(selected.slaDeadline).toISOString().split('T')[0] : ''}
                onChange={async (e) => {
                  if (!e.target.value) return;
                  await fetch(`/api/admin/tickets/${selected.id}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slaDeadline: e.target.value }),
                  });
                  load();
                }}
                className="border rounded px-2 py-1"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {selected.messages?.map((msg: any) => (
                <div key={msg.id} className={`p-3 rounded text-sm ${msg.isStaff ? 'bg-blue-50 ml-6' : 'bg-gray-50 mr-6'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-xs">{msg.isStaff ? '🛡️ Staff' : '👤 Customer'}</span>
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                </div>
              ))}
            </div>

            {selected.status !== 'CLOSED' && (
              <form onSubmit={sendReply}>
                <textarea value={reply} onChange={e => setReply(e.target.value)} required rows={3} placeholder="Reply to customer..." className="w-full border rounded px-3 py-2 mb-2 text-sm" />
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded text-sm">Send Reply</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
