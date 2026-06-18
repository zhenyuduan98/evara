'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerImage: string | null;
  featuredProductIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', bannerImage: '', featuredProductIds: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/campaigns');
      const data = await res.json();
      setCampaigns(data.data || []);
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          featuredProductIds: form.featuredProductIds ? form.featuredProductIds.split(',').map(s => s.trim()) : [],
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ title: '', description: '', bannerImage: '', featuredProductIds: '', startDate: '', endDate: '' });
        fetchCampaigns();
      }
    } catch { }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-amazon-yellow hover:bg-amazon-orange px-4 py-2 rounded font-bold text-sm">
          {showForm ? 'Cancel' : '+ New Campaign'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Banner Image URL</label>
              <input value={form.bannerImage} onChange={e => setForm({...form, bannerImage: e.target.value})} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Featured Product IDs (comma-separated)</label>
            <input value={form.featuredProductIds} onChange={e => setForm({...form, featuredProductIds: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="clxxx1, clxxx2" />
          </div>
          <button type="submit" className="bg-amazon-yellow hover:bg-amazon-orange px-6 py-2 rounded font-bold">Create Campaign</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded shadow text-gray-500">No campaigns yet</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Start</th>
                <th className="text-left px-4 py-3">End</th>
                <th className="text-left px-4 py-3">Products</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(c.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(c.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{c.featuredProductIds.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
