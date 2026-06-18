'use client';

import { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
  variables: Record<string, string> | null;
  locale: string;
}

const CHANNELS = ['EMAIL', 'SMS', 'PUSH', 'IN_APP'];

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: '', channel: 'EMAIL', subject: '', body: '', variables: '', locale: 'en' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch('/api/admin/notification-templates')
      .then(r => r.json())
      .then(d => { setTemplates(d.templates || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', channel: 'EMAIL', subject: '', body: '', variables: '', locale: 'en' });
    setEditing(null);
  };

  const startEdit = (t: Template) => {
    setEditing(t);
    setForm({
      name: t.name,
      channel: t.channel,
      subject: t.subject || '',
      body: t.body,
      variables: t.variables ? JSON.stringify(t.variables, null, 2) : '',
      locale: t.locale,
    });
  };

  const save = async () => {
    const payload = {
      ...(editing ? { id: editing.id } : {}),
      name: form.name,
      channel: form.channel,
      subject: form.subject || null,
      body: form.body,
      variables: form.variables ? JSON.parse(form.variables) : null,
      locale: form.locale,
    };

    await fetch('/api/admin/notification-templates', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    resetForm();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await fetch(`/api/admin/notification-templates?id=${id}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notification Templates</h1>

      {/* Editor */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="font-bold mb-4">{editing ? 'Edit Template' : 'New Template'}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="order_confirmation" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Channel</label>
            <select className="w-full border rounded px-3 py-2" value={form.channel}
              onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
              {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input className="w-full border rounded px-3 py-2" value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Optional subject" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Locale</label>
            <input className="w-full border rounded px-3 py-2" value={form.locale}
              onChange={e => setForm(f => ({ ...f, locale: e.target.value }))} />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Body (supports {'{{variable}}'} syntax)</label>
          <textarea className="w-full border rounded px-3 py-2 h-32 font-mono text-sm" value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Variables (JSON, optional)</label>
          <textarea className="w-full border rounded px-3 py-2 h-20 font-mono text-sm" value={form.variables}
            onChange={e => setForm(f => ({ ...f, variables: e.target.value }))}
            placeholder='{"name": "string", "orderNumber": "string"}' />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="bg-yellow-400 hover:bg-yellow-500 font-semibold px-6 py-2 rounded">
            {editing ? 'Update' : 'Create'}
          </button>
          {editing && (
            <button onClick={resetForm} className="border px-6 py-2 rounded hover:bg-gray-50">Cancel</button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Channel</th>
              <th className="text-left p-3">Subject</th>
              <th className="text-left p-3">Locale</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono">{t.name}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">{t.channel}</span>
                </td>
                <td className="p-3 text-gray-600">{t.subject || '—'}</td>
                <td className="p-3">{t.locale}</td>
                <td className="p-3 text-right">
                  <button onClick={() => startEdit(t)} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => remove(t.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No templates yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
