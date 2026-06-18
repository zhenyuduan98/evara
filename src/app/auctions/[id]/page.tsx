'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

interface Bid {
  id: string;
  amount: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface AuctionDetail {
  id: string;
  title: string;
  description?: string;
  startPrice: string;
  currentBid: string | null;
  currentBidderId: string | null;
  bidCount: number;
  status: string;
  startAt: string;
  endsAt: string;
  seller: { id: string; name: string | null };
  product?: { id: string; title: string; slug: string; price: string; images: { url: string }[] } | null;
  bids: Bid[];
}

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Auction Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [endsAt]);
  return <span className="text-2xl font-mono font-bold text-orange-600">{timeLeft}</span>;
}

export default function AuctionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState('');
  const [liveBids, setLiveBids] = useState<Array<{ id: string; amount: string; userName: string; createdAt: string }>>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetch(`/api/auctions/${id}`)
      .then((r) => r.json())
      .then(setAuction)
      .catch(() => {});
  }, [id]);

  // SSE for real-time updates
  useEffect(() => {
    const es = new EventSource(`/api/auctions/${id}/stream`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_bid') {
          setLiveBids((prev) => [
            { id: data.bid.id, amount: String(data.bid.amount), userName: data.bid.userName || 'Anonymous', createdAt: data.bid.createdAt },
            ...prev,
          ]);
          setAuction((prev) => prev ? { ...prev, currentBid: String(data.currentBid), bidCount: data.bidCount } : prev);
        }
      } catch {}
    };

    return () => es.close();
  }, [id]);

  const handleBid = async () => {
    setError('');
    setBidding(true);
    try {
      const res = await fetch(`/api/auctions/${id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bidAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place bid');
      setBidAmount('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  if (!auction) return <div className="p-8 text-center">Loading...</div>;

  const currentPrice = auction.currentBid ? parseFloat(auction.currentBid) : parseFloat(auction.startPrice);
  const minBid = (auction.currentBid ? currentPrice + 0.01 : currentPrice).toFixed(2);
  const isEnded = new Date(auction.endsAt) <= new Date();

  const allBids = [
    ...liveBids,
    ...auction.bids.map((b) => ({ id: b.id, amount: b.amount, userName: b.user.name || 'Anonymous', createdAt: b.createdAt })),
  ];

  // Deduplicate by id
  const seen = new Set<string>();
  const uniqueBids = allBids.filter((b) => { if (seen.has(b.id)) return false; seen.add(b.id); return true; });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info */}
        <div className="lg:col-span-2">
          {auction.product?.images?.[0] && (
            <div className="w-full h-64 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img src={auction.product.images[0].url} alt={auction.title} className="max-h-full object-contain" />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-2">{auction.title}</h1>
          {auction.description && <p className="text-gray-600 mb-4">{auction.description}</p>}
          <p className="text-sm text-gray-500 mb-4">Seller: {auction.seller.name || 'Unknown'}</p>

          {/* Bid History */}
          <h2 className="text-xl font-semibold mb-3">Bid History ({auction.bidCount} bids)</h2>
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {uniqueBids.length === 0 ? (
              <p className="p-4 text-gray-500">No bids yet. Be the first!</p>
            ) : (
              uniqueBids.map((bid) => (
                <div key={bid.id} className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{bid.userName}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(bid.createdAt).toLocaleString()}</span>
                  </div>
                  <span className="font-bold text-green-600">${parseFloat(bid.amount).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Bid Panel */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Time Remaining</p>
              <CountdownTimer endsAt={auction.endsAt} />
            </div>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">Current Bid</p>
              <p className="text-3xl font-bold text-green-600">${currentPrice.toFixed(2)}</p>
              <p className="text-xs text-gray-400">{auction.bidCount} bids</p>
            </div>

            {!isEnded ? (
              <div>
                <label className="block text-sm font-medium mb-1">Your Bid (min ${minBid})</label>
                <input
                  type="number"
                  step="0.01"
                  min={minBid}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-3"
                  placeholder={`$${minBid}`}
                />
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <button
                  onClick={handleBid}
                  disabled={bidding || !bidAmount}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded disabled:opacity-50"
                >
                  {bidding ? 'Placing Bid...' : 'Place Bid'}
                </button>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-green-600">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live updates active
                </div>
              </div>
            ) : (
              <div className="text-center text-red-500 font-semibold">Auction has ended</div>
            )}

            <div className="mt-4 text-xs text-gray-400 text-center">
              Start Price: ${parseFloat(auction.startPrice).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
