'use client';

import { useEffect, useState } from 'react';

interface VariantStock {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

interface ProductStock {
  id: string;
  title: string;
  sku: string;
  variants: VariantStock[];
  totalStock: number;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    fetch('/api/admin/inventory')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, []);

  const filtered = products.filter((p) => {
    if (filter === 'low') return p.totalStock > 0 && p.totalStock < 10;
    if (filter === 'out') return p.totalStock === 0;
    return true;
  });

  if (loading) return <div className="p-6">Loading inventory...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      <div className="flex gap-2 mb-6">
        {(['all', 'low', 'out'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All Products' : f === 'low' ? 'Low Stock (<10)' : 'Out of Stock'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Product</th>
              <th className="text-left px-4 py-3 font-semibold">SKU</th>
              <th className="text-left px-4 py-3 font-semibold">Variant</th>
              <th className="text-right px-4 py-3 font-semibold">Stock</th>
              <th className="text-center px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) =>
              product.variants.length > 0 ? (
                product.variants.map((v, i) => (
                  <tr key={v.id} className="border-t">
                    {i === 0 && (
                      <td className="px-4 py-3 font-medium" rowSpan={product.variants.length}>
                        {product.title}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-500">{v.sku}</td>
                    <td className="px-4 py-3">{v.name}</td>
                    <td className="px-4 py-3 text-right font-mono">{v.stock}</td>
                    <td className="px-4 py-3 text-center">
                      {v.stock === 0 ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">Out of Stock</span>
                      ) : v.stock < 10 ? (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">Low Stock</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{product.title}</td>
                  <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                  <td className="px-4 py-3 text-gray-400">—</td>
                  <td className="px-4 py-3 text-right font-mono">{product.totalStock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">No variants</span>
                  </td>
                </tr>
              )
            )}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
