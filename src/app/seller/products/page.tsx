'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  brand: string;
  price: string;
  status: string;
  images: { url: string }[];
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/seller/products')
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map(p => p.id)));
    }
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selected);

    try {
      if (bulkAction === 'delete') {
        await fetch('/api/seller/products/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds: ids }),
        });
      } else if (bulkAction === 'activate' || bulkAction === 'draft' || bulkAction === 'archive') {
        const statusMap: Record<string, string> = { activate: 'ACTIVE', draft: 'DRAFT', archive: 'ARCHIVED' };
        await fetch('/api/seller/products/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds: ids, updates: { status: statusMap[bulkAction] } }),
        });
      }
      setSelected(new Set());
      setBulkAction('');
      fetchProducts();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading products...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link href="/seller/products/new" className="bg-amazon-orange hover:bg-amazon-yellow text-black font-bold px-4 py-2 rounded-md">
          + Add Product
        </Link>
      </div>

      {/* Bulk Actions Bar */}
      {products.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 border rounded-lg">
          <input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={toggleAll} className="w-4 h-4" />
          <span className="text-sm text-gray-600">{selected.size} selected</span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="border rounded px-2 py-1 text-sm" disabled={selected.size === 0}>
            <option value="">Bulk Actions</option>
            <option value="activate">Set Active</option>
            <option value="draft">Set Draft</option>
            <option value="archive">Archive</option>
            <option value="delete">Delete (Archive)</option>
          </select>
          <button onClick={executeBulkAction} disabled={!bulkAction || selected.size === 0 || bulkLoading} className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50">
            {bulkLoading ? 'Processing...' : 'Apply'}
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-4">No products yet</p>
          <Link href="/seller/products/new" className="text-blue-600 underline">Create your first product</Link>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 w-10"></th>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Brand</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={`border-b hover:bg-gray-50 ${selected.has(p.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4" />
                  </td>
                  <td className="p-3 flex items-center gap-3">
                    {p.images[0] && (
                      <Image src={p.images[0].url} alt={p.title} className="w-12 h-12 object-cover rounded" width={48} height={48} />
                    )}
                    <span className="font-medium">{p.title}</span>
                  </td>
                  <td className="p-3">{p.brand}</td>
                  <td className="p-3">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : p.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                      {p.status}
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
