'use client';

import { useState, useEffect } from 'react';

interface PickList {
  id: string;
  warehouseId: string;
  orderId: string;
  status: string;
  assignedTo: string | null;
  items: unknown;
  createdAt: string;
}

interface Shipment {
  id: string;
  orderId: string;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  createdAt: string;
}

interface ReturnReq {
  id: string;
  orderId: string;
  status: string;
  reason: string;
  returnLabel: string | null;
  createdAt: string;
}

export default function FulfillmentDashboard() {
  const [pickLists, setPickLists] = useState<PickList[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [returns, setReturns] = useState<ReturnReq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [shipRes, retRes] = await Promise.all([
          fetch('/api/admin/warehouses'),
          fetch('/api/admin/returns'),
        ]);
        if (shipRes.ok) {
          const data = await shipRes.json();
          setShipments(data.shipments || []);
        }
        if (retRes.ok) {
          const data = await retRes.json();
          setReturns(data.returns || data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PICKING: 'bg-blue-100 text-blue-800',
      PICKED: 'bg-indigo-100 text-indigo-800',
      PACKED: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-green-200 text-green-900',
      APPROVED: 'bg-blue-100 text-blue-800',
      RECEIVED: 'bg-teal-100 text-teal-800',
      PROCESSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return <div className="p-8">Loading fulfillment data...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Fulfillment Dashboard</h1>

      {/* Pick Lists */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Pick Lists</h2>
        {pickLists.length === 0 ? (
          <p className="text-gray-500">No active pick lists. Generate from warehouse orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Order</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Assigned To</th>
                  <th className="px-4 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {pickLists.map((pl) => (
                  <tr key={pl.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm">{pl.orderId.slice(0, 8)}...</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(pl.status)}`}>
                        {pl.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{pl.assignedTo || '—'}</td>
                    <td className="px-4 py-2 text-sm">{new Date(pl.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Shipments Pipeline */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Shipments Pipeline</h2>
        {shipments.length === 0 ? (
          <p className="text-gray-500">No shipments in pipeline.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Shipment</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Carrier</th>
                  <th className="px-4 py-2 text-left">Tracking</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm">{s.id.slice(0, 8)}...</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{s.carrier || '—'}</td>
                    <td className="px-4 py-2 font-mono text-xs">{s.trackingNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Returns Processing */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Return Processing</h2>
        {returns.length === 0 ? (
          <p className="text-gray-500">No return requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Return ID</th>
                  <th className="px-4 py-2 text-left">Order</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Label</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm">{r.id.slice(0, 8)}...</td>
                    <td className="px-4 py-2 font-mono text-sm">{r.orderId.slice(0, 8)}...</td>
                    <td className="px-4 py-2">{r.reason}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{r.returnLabel || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
