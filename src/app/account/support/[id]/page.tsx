'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => fetch(`/api/tickets/${id}`).then(r => r.json()).then(setTicket);

  useEffect(() => { load(); }, [id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await fetch(`/api/tickets/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    setBody('');
    await load();
    setSending(false);
  };

  const closeTicket = async () => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CLOSED' }),
    });
    load();
  };

  if (!ticket) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{ticket.subject}</h2>
          <p className="text-sm text-gray-500 mt-1">{ticket.category} · Created {new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[ticket.status] || ''}`}>
            {ticket.status.replace('_', ' ')}
          </span>
          {ticket.status !== 'CLOSED' && (
            <button onClick={closeTicket} className="text-sm text-gray-500 hover:text-red-600 border rounded px-3 py-1">Close</button>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {ticket.messages?.map((msg: any) => (
          <div key={msg.id} className={`p-4 rounded-lg ${msg.isStaff ? 'bg-blue-50 border-blue-200 border ml-8' : 'bg-gray-50 border mr-8'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">{msg.isStaff ? '🛡️ Support Agent' : '👤 You'}</span>
              <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
          </div>
        ))}
      </div>

      {ticket.status !== 'CLOSED' && (
        <form onSubmit={sendMessage} className="border rounded-lg p-4 bg-white">
          <textarea value={body} onChange={e => setBody(e.target.value)} required rows={3} placeholder="Type your message..." className="w-full border rounded px-3 py-2 mb-3" />
          <button type="submit" disabled={sending} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded disabled:opacity-50">
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
}
