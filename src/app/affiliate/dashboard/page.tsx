'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

interface AffLink {
  id: string;
  code: string;
  clicks: number;
  conversions: number;
  earnings: string;
  createdAt: string;
  product: { title: string; slug: string; price: string; images: { url: string }[] };
}

export default function AffiliateDashboardPage() {
  const [data, setData] = useState<{ links: AffLink[]; totals: { clicks: number; conversions: number; earnings: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/affiliate/stats')
      .then(r => r.json())
      .then(d => setData(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}?ref=${code}`);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) return <div className="max-w-screen-xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Affiliate Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded shadow p-6 text-center">
          <p className="text-3xl font-bold text-amazon-dark">{data?.totals.clicks || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Clicks</p>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{data?.totals.conversions || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Conversions</p>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <p className="text-3xl font-bold text-amazon-orange">${Number(data?.totals.earnings || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Earnings</p>
        </div>
      </div>

      {/* Links */}
      <h2 className="text-xl font-bold mb-4">Your Affiliate Links</h2>
      {!data?.links.length ? (
        <div className="bg-white rounded shadow p-8 text-center text-gray-500">
          No affiliate links yet. Links will appear here when you generate them from product pages.
        </div>
      ) : (
        <div className="space-y-3">
          {data.links.map((link) => (
            <div key={link.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-amazon-dark">{link.product.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Code: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{link.code}</span></p>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Clicks: <strong>{link.clicks}</strong></span>
                <span>Conv: <strong>{link.conversions}</strong></span>
                <span>Earned: <strong className="text-green-600">${Number(link.earnings).toFixed(2)}</strong></span>
              </div>
              <button onClick={() => copyLink(link.code)} className="bg-amazon-yellow hover:bg-amazon-orange px-4 py-2 rounded text-sm font-bold whitespace-nowrap">
                {copied === link.code ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
