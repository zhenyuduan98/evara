'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
      });
      // Fetch full profile to get phone
      fetch('/api/account/profile').then(r => r.json()).then(data => {
        if (data.user) {
          setForm(f => ({ ...f, name: data.user.name || '', email: data.user.email || '', phone: data.user.phone || '' }));
        }
      });
    }
  }, [session]);

  if (status === 'loading') return null;
  if (!session) {
    signIn();
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        await update();
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 overflow-hidden">
          {session.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Image src={session.user.image} alt="Avatar" className="w-full h-full object-cover"  fill sizes="(max-width: 768px) 100vw, 50vw" />
          ) : (
            <span>{(session.user?.name?.[0] || '?').toUpperCase()}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-lg">{session.user?.name || 'User'}</p>
          <p className="text-sm text-gray-500">{session.user?.email}</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            className={inputCls}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold px-8 py-2.5 rounded-lg transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
