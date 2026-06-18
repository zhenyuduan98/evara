'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Auction {
  id: string;
  title: string;
  description?: string;
  startPrice: string;
  currentBid: string | null;
  bidCount: number;
  status: string;
  startAt: string;
  endsAt: string;
  seller: { id: string; name: string | null; image: string | null };
  product?: { id: string; title: string; images: { url: string }[] } | null;
}

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [endsAt]);

  return <span className={timeLeft === 'Ended' ? 'text-red-500' : 'text-orange-500'}>{timeLeft}</span>;
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auctions')
      .then((r) => r.json())
      .then((data) => { setAuctions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading auctions...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Live Auctions</h1>
      {auctions.length === 0 ? (
        <p className="text-gray-500">No active auctions right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <Link key={auction.id} href={`/auctions/${auction.id}`}>
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                {auction.product?.images?.[0] && (
                  <div className="w-full h-48 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                    <img src={auction.product.images[0].url} alt={auction.title} className="max-h-full object-contain" />
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{auction.title}</h3>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm text-gray-500">Current Bid</span>
                    <p className="text-xl font-bold text-green-600">
                      ${auction.currentBid ? parseFloat(auction.currentBid).toFixed(2) : parseFloat(auction.startPrice).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">{auction.bidCount} bids</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${auction.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {auction.status}
                  </span>
                  <CountdownTimer endsAt={auction.endsAt} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
