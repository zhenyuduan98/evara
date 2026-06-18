'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';

interface AddressType {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const emptyForm = { name: '', addressLine1: '', addressLine2: '', city: '', state: '', zipCode: '', country: 'US', phone: '' };

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>;

function validateForm(form: typeof emptyForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Full name is required';
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Address is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state.trim()) errors.state = 'State is required';
  if (!form.zipCode.trim()) {
    errors.zipCode = 'ZIP code is required';
  } else if (!/^\d{5}(-\d{4})?$/.test(form.zipCode.trim())) {
    errors.zipCode = 'Enter a valid ZIP code (e.g., 12345 or 12345-6789)';
  }
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^[\d\s()+-]{7,20}$/.test(form.phone.trim())) {
    errors.phone = 'Enter a valid phone number';
  }
  return errors;
}

export default function AddressesPage() {
  const { status } = useSession();
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    const res = await fetch('/api/addresses');
    const data = await res.json();
    setAddresses(data.addresses || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') fetchAddresses();
    else if (status === 'unauthenticated') setLoading(false);
  }, [status, fetchAddresses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;
    await fetch('/api/addresses', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
    setEditingId(null);
    setSubmitting(false);
    fetchAddresses();
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    await fetch('/api/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAddresses();
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/addresses/${id}/default`, { method: 'PUT' });
    fetchAddresses();
  };

  const startEdit = (addr: AddressType) => {
    setEditingId(addr.id);
    setForm({
      name: addr.name,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      phone: addr.phone,
    });
    setErrors({});
    setShowForm(true);
  };

  if (loading) return <div>Loading...</div>;

  const inputCls = 'w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400';
  const errorCls = 'text-red-500 text-xs mt-0.5';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Addresses</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => { setEditingId(null); setForm(emptyForm); setErrors({}); setShowForm(true); }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-700 min-h-[180px]"
        >
          <div className="text-center">
            <span className="text-4xl block mb-2">+</span>
            <span>Add Address</span>
          </div>
        </button>

        {addresses.map((addr) => (
          <div key={addr.id} className={`border rounded-lg p-4 relative ${addr.isDefault ? 'border-yellow-400 ring-2 ring-yellow-200' : ''}`}>
            {addr.isDefault && (
              <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">Default</span>
            )}
            <p className="font-bold">{addr.name}</p>
            <p className="text-sm text-gray-600">{addr.addressLine1}</p>
            {addr.addressLine2 && <p className="text-sm text-gray-600">{addr.addressLine2}</p>}
            <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zipCode}</p>
            <p className="text-sm text-gray-600">{addr.country}</p>
            <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
            <div className="flex gap-3 mt-3 text-sm">
              <button onClick={() => startEdit(addr)} className="text-blue-600 hover:underline">Edit</button>
              <button onClick={() => deleteAddress(addr.id)} className="text-red-600 hover:underline">Delete</button>
              {!addr.isDefault && (
                <button onClick={() => setDefault(addr.id)} className="text-blue-600 hover:underline">Set as Default</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div>
                <input className={`${inputCls} ${errors.name ? 'border-red-400' : ''}`} placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className={errorCls}>{errors.name}</p>}
              </div>
              <div>
                <input className={`${inputCls} ${errors.addressLine1 ? 'border-red-400' : ''}`} placeholder="Address Line 1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
                {errors.addressLine1 && <p className={errorCls}>{errors.addressLine1}</p>}
              </div>
              <input className={inputCls} placeholder="Address Line 2 (optional)" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input className={`${inputCls} ${errors.city ? 'border-red-400' : ''}`} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  {errors.city && <p className={errorCls}>{errors.city}</p>}
                </div>
                <div>
                  <input className={`${inputCls} ${errors.state ? 'border-red-400' : ''}`} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  {errors.state && <p className={errorCls}>{errors.state}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input className={`${inputCls} ${errors.zipCode ? 'border-red-400' : ''}`} placeholder="ZIP Code" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
                  {errors.zipCode && <p className={errorCls}>{errors.zipCode}</p>}
                </div>
                <input className={inputCls} placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div>
                <input className={`${inputCls} ${errors.phone ? 'border-red-400' : ''}`} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <p className={errorCls}>{errors.phone}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold px-6 py-2 rounded">
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Add Address'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setErrors({}); }} className="border px-6 py-2 rounded hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
