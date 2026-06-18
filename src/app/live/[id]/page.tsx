'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface LiveProductItem {
  id: string;
  displayOrder: number;
  specialPrice: string | null;
  isActive: boolean;
  product: {
    id: string;
    title: string;
    price: string;
    images: { url: string }[];
  };
}

interface StreamDetail {
  id: string;
  title: string;
  description: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  scheduledAt: string;
  startedAt: string | null;
  viewerCount: number;
  seller: { id: string; name: string | null; image: string | null };
  products: LiveProductItem[];
  comments: Comment[];
}

export default function LiveStreamPage() {
  const { id } = useParams();
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/live/streams/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setStream(data);
        setComments(data.comments?.reverse() || []);
      });
  }, [id]);

  useEffect(() => {
    if (!stream || stream.status !== 'LIVE') return;

    const eventSource = new EventSource(`/api/live/streams/${id}/comments/stream`);
    eventSource.onmessage = (e) => {
      try {
        const newComments: Comment[] = JSON.parse(e.data);
        setComments((prev) => {
          const ids = new Set(prev.map((c) => c.id));
          const unique = newComments.filter((c) => !ids.has(c.id));
          return [...prev, ...unique];
        });
      } catch {
        // keepalive
      }
    };

    return () => eventSource.close();
  }, [id, stream?.status]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [comments]);

  const sendComment = async () => {
    if (!newComment.trim()) return;
    await fetch(`/api/live/streams/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'anonymous', content: newComment }),
    });
    setNewComment('');
  };

  if (!stream) return <div className="p-8">Loading...</div>;

  const activeProducts = stream.products.filter((p) => p.isActive);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video area */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-gray-900 to-purple-900 rounded-lg aspect-video flex items-center justify-center">
            {stream.status === 'LIVE' && (
              <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                🔴 LIVE
              </span>
            )}
            {stream.status === 'SCHEDULED' && (
              <span className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                ⏰ SCHEDULED
              </span>
            )}
            {stream.status === 'ENDED' && (
              <span className="absolute top-4 left-4 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                ENDED
              </span>
            )}
            <span className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
              👁 {stream.viewerCount} viewers
            </span>
            <span className="text-white text-6xl">📺</span>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{stream.title}</h1>
            <p className="text-gray-500 mt-1">
              by {stream.seller.name || 'Seller'} · {new Date(stream.scheduledAt).toLocaleString()}
            </p>
            {stream.description && <p className="text-gray-600 mt-2">{stream.description}</p>}
          </div>

          {/* Products */}
          {activeProducts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">🛍️ Featured Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeProducts.map((lp) => (
                  <div key={lp.id} className="border rounded-lg p-4 flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
                      📦
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm truncate">{lp.product.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {lp.specialPrice ? (
                          <>
                            <span className="text-red-600 font-bold">${lp.specialPrice}</span>
                            <span className="text-gray-400 line-through text-sm">${lp.product.price}</span>
                          </>
                        ) : (
                          <span className="font-bold">${lp.product.price}</span>
                        )}
                      </div>
                    </div>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap">
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className="border rounded-lg flex flex-col h-[600px]">
          <div className="p-3 border-b font-semibold bg-gray-50 rounded-t-lg">
            💬 Live Chat ({comments.length})
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-medium text-blue-600">{c.user.name || 'User'}:</span>{' '}
                <span>{c.content}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              placeholder="Say something..."
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={sendComment}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
