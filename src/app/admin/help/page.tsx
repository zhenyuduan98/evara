'use client';

import { useState, useEffect } from 'react';

export default function AdminHelpPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', slug: '', body: '', category: 'Getting Started', tags: '', published: true });
  const [loading, setLoading] = useState(true);

  const load = () => fetch('/api/help/admin').then(r => r.json()).then(setArticles).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ title: '', slug: '', body: '', category: 'Getting Started', tags: '', published: true });
  };

  const editArticle = (a: any) => {
    setEditing(a);
    setForm({ title: a.title, slug: a.slug, body: a.body, category: a.category, tags: a.tags?.join(', ') || '', published: !!a.publishedAt });
  };

  const saveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };

    if (editing) {
      await fetch('/api/help/admin', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) });
    } else {
      await fetch('/api/help/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    resetForm();
    load();
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await fetch('/api/help/admin', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const CATEGORIES = ['Getting Started', 'Orders', 'Returns', 'Account', 'Payments', 'Shipping', 'Technical'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Help Articles</h1>

      <form onSubmit={saveArticle} className="bg-white border rounded-lg p-6 mb-6 space-y-4">
        <h2 className="font-semibold">{editing ? 'Edit Article' : 'New Article'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded px-3 py-2">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Body</label>
          <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={10} className="w-full border rounded px-3 py-2 font-mono text-sm" />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-2 ml-auto">
            {editing && <button type="button" onClick={resetForm} className="border rounded px-4 py-2 text-sm">Cancel</button>}
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded text-sm">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </form>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a: any) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3">{a.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${a.publishedAt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {a.publishedAt ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => editArticle(a)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => deleteArticle(a.id)} className="text-red-600 hover:underline">Delete</button>
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
