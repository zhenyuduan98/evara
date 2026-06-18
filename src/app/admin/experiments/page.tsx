'use client';

import { useState, useEffect } from 'react';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: string;
  variants: string[];
  trafficPercent: number;
  createdAt: string;
  _count: { assignments: number };
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', variants: 'control,variant_a', trafficPercent: 100 });

  const loadExperiments = () => {
    fetch('/api/admin/experiments').then(r => r.json()).then(d => setExperiments(d.experiments || []));
  };

  useEffect(() => { loadExperiments(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        variants: form.variants.split(',').map(v => v.trim()),
      }),
    });
    setShowForm(false);
    setForm({ name: '', description: '', variants: 'control,variant_a', trafficPercent: 100 });
    loadExperiments();
  };

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    PAUSED: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🧪 A/B Experiments</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {showForm ? 'Cancel' : '+ New Experiment'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <input type="text" placeholder="Experiment name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <input type="text" placeholder="Variants (comma-separated)" value={form.variants} onChange={e => setForm({ ...form, variants: e.target.value })} className="w-full border rounded px-3 py-2" />
            <input type="number" placeholder="Traffic %" value={form.trafficPercent} onChange={e => setForm({ ...form, trafficPercent: Number(e.target.value) })} className="w-32 border rounded px-3 py-2" min={1} max={100} />
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Create</button>
          </form>
        )}

        <div className="space-y-4">
          {experiments.map(exp => (
            <div key={exp.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{exp.name}</h3>
                  <p className="text-gray-600 text-sm">{exp.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[exp.status] || ''}`}>{exp.status}</span>
              </div>
              <div className="mt-3 flex gap-6 text-sm text-gray-500">
                <span>Variants: {(exp.variants as string[]).join(', ')}</span>
                <span>Traffic: {exp.trafficPercent}%</span>
                <span>Assignments: {exp._count.assignments}</span>
              </div>
            </div>
          ))}
          {experiments.length === 0 && <p className="text-center text-gray-500 py-12">No experiments yet.</p>}
        </div>
      </div>
    </div>
  );
}
