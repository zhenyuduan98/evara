'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  bid: string;
  dailyBudget: string;
  impressions: number;
  clicks: number;
  isActive: boolean;
  createdAt: string;
  product: { id: string; title: string; price: string; images: { url: string }[] };
}

interface Summary {
  totalCampaigns: number;
  activeCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
}

export default function AdvertisingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/advertising/campaigns')
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          setCampaigns(res.data.campaigns);
          setSummary(res.data.summary);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><p>Loading advertising data...</p></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Advertising Manager</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Campaigns', value: summary.totalCampaigns },
            { label: 'Active', value: summary.activeCampaigns },
            { label: 'Impressions', value: summary.totalImpressions.toLocaleString() },
            { label: 'Clicks', value: summary.totalClicks.toLocaleString() },
            { label: 'Total Spend', value: `$${summary.totalSpend.toFixed(2)}` },
          ].map(item => (
            <div key={item.label} className="bg-white border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-bold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No ad campaigns yet</p>
          <p className="text-sm mt-1">Create sponsored product ads to boost visibility</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-right p-3 text-sm font-medium text-gray-500">Bid</th>
                <th className="text-right p-3 text-sm font-medium text-gray-500">Budget</th>
                <th className="text-right p-3 text-sm font-medium text-gray-500">Impressions</th>
                <th className="text-right p-3 text-sm font-medium text-gray-500">Clicks</th>
                <th className="text-right p-3 text-sm font-medium text-gray-500">CTR</th>
                <th className="text-center p-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium truncate max-w-xs">{c.product.title}</p>
                  </td>
                  <td className="p-3 text-right">${Number(c.bid).toFixed(2)}</td>
                  <td className="p-3 text-right">${Number(c.dailyBudget).toFixed(2)}/day</td>
                  <td className="p-3 text-right">{c.impressions.toLocaleString()}</td>
                  <td className="p-3 text-right">{c.clicks.toLocaleString()}</td>
                  <td className="p-3 text-right">{c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : '0.00'}%</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Paused'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
