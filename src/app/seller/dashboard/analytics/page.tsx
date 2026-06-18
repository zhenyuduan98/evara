'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  totalProducts: number;
  activeProducts: number;
  topProducts: { id: string; title: string; revenue: number; units: number }[];
  monthlySales: { month: string; revenue: number; orders: number }[];
  conversionRate: number;
  trafficStats: { views: number; period: string };
  sellerRating: number;
}

export default function SellerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/analytics/dashboard')
      .then(r => r.json())
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!data) return <div className="p-6 text-red-500">Failed to load analytics</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">${data.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Monthly Revenue</p>
          <p className="text-2xl font-bold">${data.monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{data.totalOrders}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Conversion Rate</p>
          <p className="text-2xl font-bold">{data.conversionRate}%</p>
        </div>
      </div>

      {/* Traffic & Rating */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Page Views (30d)</p>
          <p className="text-2xl font-bold">{data.trafficStats.views.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active Products</p>
          <p className="text-2xl font-bold">{data.activeProducts}/{data.totalProducts}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Seller Rating</p>
          <p className="text-2xl font-bold text-yellow-500">{data.sellerRating.toFixed(1)} ★</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Monthly Orders</p>
          <p className="text-2xl font-bold">{data.monthlyOrders}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">Revenue Trend (6 Months)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">Orders per Month</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Top Products</h2>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-right p-3">Revenue</th>
              <th className="text-right p-3">Units Sold</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts.map(p => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-right font-medium">${p.revenue.toLocaleString()}</td>
                <td className="p-3 text-right">{p.units}</td>
              </tr>
            ))}
            {data.topProducts.length === 0 && (
              <tr><td colSpan={3} className="p-3 text-center text-gray-500">No sales data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
