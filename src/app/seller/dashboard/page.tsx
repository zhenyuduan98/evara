'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  monthlySales: { month: string; revenue: number; orders: number }[];
  topProducts: { id: string; title: string; revenue: number; units: number }[];
  performanceScore: number;
  reviewCount: number;
  sellerStatus: string;
  sellerRating: number;
}

export default function SellerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!data) return <div className="p-6">Failed to load dashboard. <Link href="/seller" className="text-blue-600 underline">Register as seller</Link></div>;

  const maxRevenue = Math.max(...data.monthlySales.map((m) => m.revenue), 1);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${data.sellerStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : data.sellerStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
            {data.sellerStatus}
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">⭐ {data.sellerRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `$${data.totalRevenue.toFixed(2)}` },
          { label: 'Total Orders', value: data.totalOrders },
          { label: 'Units Sold', value: data.totalUnitsSold },
          { label: 'Products', value: `${data.activeProducts} / ${data.totalProducts}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sales Chart (simple bar chart) */}
      <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Monthly Revenue</h2>
        <div className="flex items-end gap-2 h-48">
          {data.monthlySales.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">${m.revenue.toFixed(0)}</span>
              <div
                className="w-full bg-amazon-orange rounded-t"
                style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-xs mt-1">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/seller/products" className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition text-center">
          <p className="text-4xl mb-2">📦</p>
          <p className="font-bold">Manage Products</p>
        </Link>
        <Link href="/seller/products/new" className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition text-center">
          <p className="text-4xl mb-2">➕</p>
          <p className="font-bold">Add New Product</p>
        </Link>
        <Link href="/seller/orders" className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition text-center">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-bold">View Orders</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Top Products</h2>
          {data.topProducts.length === 0 ? <p className="text-gray-500">No sales yet.</p> : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.units} units sold</p>
                  </div>
                  <span className="font-bold text-green-600">${p.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Seller Performance</h2>
          <div className="flex items-center justify-center mb-4">
            <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center">
              <span className="text-3xl font-bold">{data.performanceScore}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-bold">{data.sellerRating.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
            <div>
              <p className="font-bold">{data.reviewCount}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
            <div>
              <p className="font-bold">{data.totalUnitsSold}</p>
              <p className="text-xs text-gray-500">Units Sold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/seller/products/bulk-upload" className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition text-center">
          <p className="text-4xl mb-2">📄</p>
          <p className="font-bold">Bulk Upload Products</p>
        </Link>
        <Link href="/seller/earnings" className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition text-center">
          <p className="text-4xl mb-2">💰</p>
          <p className="font-bold">View Earnings</p>
        </Link>
      </div>
    </div>
  );
}
