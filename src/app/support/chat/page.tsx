'use client';

import { useState, useEffect, useRef } from 'react';

export default function LiveChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [closed, setClosed] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const startSession = async () => {
    setLoading(true);
    const res = await fetch('/api/chat/start', { method: 'POST' });
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setSessionId(data.id);
    setLoading(false);
    connectSSE(data.id);
  };

  const connectSSE = (sid: string) => {
    const es = new EventSource(`/api/chat/stream?sessionId=${sid}`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init' || data.type === 'messages') {
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          const newMsgs = data.messages.filter((m: any) => !existing.has(m.id));
          return [...prev, ...newMsgs];
        });
      } else if (data.type === 'closed') {
        setClosed(true);
        es.close();
      }
    };
    eventSourceRef.current = es;
  };

  useEffect(() => {
    return () => { eventSourceRef.current?.close(); };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;
    const content = input;
    setInput('');
    await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, content }),
    });
  };

  const senderLabel = (type: string) => {
    if (type === 'BOT') return '🤖 Bot';
    if (type === 'AGENT') return '🛡️ Agent';
    return '👤 You';
  };

  const senderColor = (type: string) => {
    if (type === 'BOT') return 'bg-amber-50';
    if (type === 'AGENT') return 'bg-blue-50 ml-4';
    return 'bg-gray-50 mr-4';
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">💬 Live Chat Support</h1>

      {!sessionId ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Start a live chat session with our support team.</p>
          <button onClick={startSession} disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg disabled:opacity-50">
            {loading ? 'Starting...' : 'Start Chat'}
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-lg flex flex-col" style={{ height: '70vh' }}>
          <div className="bg-yellow-400 px-4 py-3 rounded-t-lg flex items-center justify-between">
            <span className="font-semibold">Chat Session</span>
            {closed && <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded">Closed</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-3 rounded-lg text-sm ${senderColor(msg.senderType)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-xs">{senderLabel(msg.senderType)}</span>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {!closed && (
            <form onSubmit={sendMessage} className="border-t p-3 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <button type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg text-sm">
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
