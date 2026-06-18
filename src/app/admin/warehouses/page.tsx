'use client';

import { useEffect, useState } from 'react';

interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
}

export default function AdminWarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', zipCode: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchWarehouses = () => {
    fetch('/api/admin/warehouses')
      .then((r) => r.json())
      .then((d) => setWarehouses(d.warehouses || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { ...form, id: editId } : form;
    await fetch('/api/admin/warehouses', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowForm(false);
    setEditId(null);
    setForm({ name: '', address: '', city: '', state: '', zipCode: '' });
    fetchWarehouses();
  };

  const toggleActive = async (w: Warehouse) => {
    await fetch('/api/admin/warehouses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: w.id, isActive: !w.isActive }),
    });
    fetchWarehouses();
  };

  const startEdit = (w: Warehouse) => {
    setForm({ name: w.name, address: w.address, city: w.city, state: w.state, zipCode: w.zipCode });
    setEditId(w.id);
    setShowForm(true);
  };

  if (loading) return <div className="p-6">Loading warehouses...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Warehouse Management</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', address: '', city: '', state: '', zipCode: '' }); }} className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600">
          {showForm ? 'Cancel' : '+ Add Warehouse'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['name', 'address', 'city', 'state', 'zipCode'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">{field === 'zipCode' ? 'ZIP Code' : field}</label>
              <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required className="w-full border rounded px-3 py-2" />
            </div>
          ))}
          <div className="md:col-span-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">{editId ? 'Update' : 'Create'} Warehouse</button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Address</th>
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">State</th>
              <th className="text-left p-3">ZIP</th>
              <th className="text-center p-3">Status</th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="p-3 font-medium">{w.name}</td>
                <td className="p-3">{w.address}</td>
                <td className="p-3">{w.city}</td>
                <td className="p-3">{w.state}</td>
                <td className="p-3">{w.zipCode}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${w.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {w.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => startEdit(w)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => toggleActive(w)} className="text-amber-600 hover:underline text-xs">{w.isActive ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
            {warehouses.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-gray-500">No warehouses yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
