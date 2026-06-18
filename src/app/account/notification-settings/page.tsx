'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = [
  { key: 'order', label: 'Order Updates', description: 'Status changes, shipping, delivery' },
  { key: 'promo', label: 'Promotions & Deals', description: 'Sales, coupons, and special offers' },
  { key: 'system', label: 'System & Security', description: 'Account alerts, sign-ins, password changes' },
  { key: 'social', label: 'Social & Reviews', description: 'Replies, mentions, review responses' },
];

const CHANNELS = [
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
  { key: 'sms', label: 'SMS' },
  { key: 'inApp', label: 'In-App' },
];

type Prefs = Record<string, Record<string, boolean>>;

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then(r => r.json())
      .then(data => {
        const map: Prefs = {};
        (data.preferences || []).forEach((p: Record<string, boolean | string>) => {
          map[p.category as string] = {
            email: p.email as boolean,
            push: p.push as boolean,
            sms: p.sms as boolean,
            inApp: p.inApp as boolean,
          };
        });
        // Fill defaults
        CATEGORIES.forEach(c => {
          if (!map[c.key]) map[c.key] = { email: true, push: true, sms: false, inApp: true };
        });
        setPrefs(map);
        setLoading(false);
      })
      .catch(() => {
        const defaults: Prefs = {};
        CATEGORIES.forEach(c => { defaults[c.key] = { email: true, push: true, sms: false, inApp: true }; });
        setPrefs(defaults);
        setLoading(false);
      });
  }, []);

  const toggle = (cat: string, channel: string) => {
    setPrefs(prev => ({
      ...prev,
      [cat]: { ...prev[cat], [channel]: !prev[cat][channel] },
    }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    const preferences = Object.entries(prefs).map(([category, channels]) => ({
      category,
      ...channels,
    }));

    await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_70px_70px_70px_70px] gap-2 p-4 border-b bg-gray-50 font-semibold text-sm">
          <span>Category</span>
          {CHANNELS.map(ch => (
            <span key={ch.key} className="text-center">{ch.label}</span>
          ))}
        </div>
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="grid grid-cols-[1fr_70px_70px_70px_70px] gap-2 p-4 border-b last:border-0 items-center">
            <div>
              <p className="font-medium">{cat.label}</p>
              <p className="text-sm text-gray-500">{cat.description}</p>
            </div>
            {CHANNELS.map(ch => (
              <div key={ch.key} className="flex justify-center">
                <button
                  onClick={() => toggle(cat.key, ch.key)}
                  className={`w-10 h-6 rounded-full transition ${prefs[cat.key]?.[ch.key] ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${prefs[cat.key]?.[ch.key] ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Saved</span>}
      </div>
    </div>
  );
}
