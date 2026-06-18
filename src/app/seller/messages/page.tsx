'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  orderId: string | null;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newMessage, setNewMessage] = useState({ receiverId: '', content: '', orderId: '' });
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const fetchMessages = (p: number) => {
    setLoading(true);
    fetch(`/api/seller/messages?page=${p}&limit=20`)
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          setMessages(res.data.messages);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(page); }, [page]);

  const sendMessage = async () => {
    if (!newMessage.receiverId || !newMessage.content) return;
    setSending(true);
    try {
      await fetch('/api/seller/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });
      setNewMessage({ receiverId: '', content: '', orderId: '' });
      setShowCompose(false);
      fetchMessages(1);
      setPage(1);
    } catch (e) { console.error(e); }
    setSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <button onClick={() => setShowCompose(!showCompose)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {showCompose ? 'Cancel' : 'New Message'}
        </button>
      </div>

      {showCompose && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3">Compose Message</h2>
          <input
            placeholder="Buyer ID"
            value={newMessage.receiverId}
            onChange={e => setNewMessage(m => ({ ...m, receiverId: e.target.value }))}
            className="w-full border rounded p-2 mb-2"
          />
          <input
            placeholder="Order ID (optional)"
            value={newMessage.orderId}
            onChange={e => setNewMessage(m => ({ ...m, orderId: e.target.value }))}
            className="w-full border rounded p-2 mb-2"
          />
          <textarea
            placeholder="Message content..."
            value={newMessage.content}
            onChange={e => setNewMessage(m => ({ ...m, content: e.target.value }))}
            className="w-full border rounded p-2 mb-2 h-24"
          />
          <button onClick={sendMessage} disabled={sending} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No messages yet</p>
          <p className="text-sm mt-1">Messages with buyers will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`border rounded-lg p-4 ${!msg.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm text-gray-500">
                    {msg.senderId === msg.receiverId ? 'You' : `From: ${msg.senderId.slice(0, 8)}...`}
                  </span>
                  {msg.orderId && <span className="text-xs ml-2 bg-gray-100 px-2 py-0.5 rounded">Order: {msg.orderId.slice(0, 8)}...</span>}
                  {!msg.read && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">New</span>}
                </div>
                <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2">{msg.content}</p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
