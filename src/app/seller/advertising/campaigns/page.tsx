'use client';

import { useState } from 'react';

interface Campaign {
  id: string;
  productName: string;
  bidAmount: number;
  dailyBudget: number;
  impressions: number;
  clicks: number;
  spent: number;
  status: string;
}

export default function AdvertisingCampaignsPage() {
  const [campaigns] = useState<Campaign[]>([]);
  const [bidAmount, setBidAmount] = useState('0.50');
  const [dailyBudget, setDailyBudget] = useState('10.00');
  const [sponsoredProductId, setSponsoredProductId] = useState('');

  const handleCreateBid = async () => {
    try {
      await fetch('/api/ads/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsoredProductId,
          bidAmount: parseFloat(bidAmount),
          dailyBudget: parseFloat(dailyBudget),
        }),
      });
      alert('Bid created successfully');
    } catch {
      alert('Failed to create bid');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Advertising Campaigns</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Ad Bid</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sponsored Product ID</label>
            <input
              type="text"
              value={sponsoredProductId}
              onChange={(e) => setSponsoredProductId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter product ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bid Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Daily Budget ($)</label>
            <input
              type="number"
              step="0.01"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          onClick={handleCreateBid}
          className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
        >
          Create Bid
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
        {campaigns.length === 0 ? (
          <p className="text-gray-500">No active campaigns. Create your first ad bid above.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Bid</th>
                <th className="text-left py-2">Budget</th>
                <th className="text-left py-2">Impressions</th>
                <th className="text-left py-2">Clicks</th>
                <th className="text-left py-2">CTR</th>
                <th className="text-left py-2">Spent</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2">{c.productName}</td>
                  <td className="py-2">${c.bidAmount}</td>
                  <td className="py-2">${c.dailyBudget}</td>
                  <td className="py-2">{c.impressions}</td>
                  <td className="py-2">{c.clicks}</td>
                  <td className="py-2">
                    {c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : 0}%
                  </td>
                  <td className="py-2">${c.spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
