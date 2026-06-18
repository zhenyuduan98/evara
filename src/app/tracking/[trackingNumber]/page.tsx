'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

interface TrackingData {
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  orderNumber: string;
  destination: string | null;
  origin: string | null;
  events: TrackingEvent[];
}

const statusSteps = ['PENDING', 'PICKED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'];

export default function TrackingPage() {
  const params = useParams();
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/tracking/${params.trackingNumber}`)
      .then((r) => r.json())
      .then((res) => { if (res.data) setData(res.data); else setError('Not found'); })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [params.trackingNumber]);

  if (loading) return <div className="max-w-3xl mx-auto p-6">Loading tracking info...</div>;
  if (error || !data) return <div className="max-w-3xl mx-auto p-6 text-red-600">{error || 'Not found'}</div>;

  const currentStepIndex = statusSteps.indexOf(data.status);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Track Your Package</h1>
      <p className="text-gray-500 mb-6">Tracking #: {data.trackingNumber} {data.carrier && `• ${data.carrier}`}</p>

      {/* Status Progress Bar */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex justify-between mb-2">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStepIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i <= currentStepIndex ? '✓' : i + 1}
              </div>
              <span className="text-xs mt-1 text-center">{step.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded mt-2">
          <div className="bg-green-500 h-2 rounded transition-all" style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* Delivery Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Estimated Delivery</p>
          <p className="text-lg font-bold">
            {data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Calculating...'}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Order Number</p>
          <p className="text-lg font-bold">{data.orderNumber}</p>
        </div>
        {data.origin && (
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Ship From</p>
            <p className="font-medium">{data.origin}</p>
          </div>
        )}
        {data.destination && (
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Ship To</p>
            <p className="font-medium">{data.destination}</p>
          </div>
        )}
      </div>

      {/* Delivery Confirmation */}
      {data.status === 'DELIVERED' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📦✅</span>
            <div>
              <h2 className="text-lg font-bold text-green-800">Delivered!</h2>
              <p className="text-green-700">
                Delivered on {data.deliveredAt ? new Date(data.deliveredAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Events */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Tracking History</h2>
        {data.events.length === 0 ? (
          <p className="text-gray-500">No tracking events yet.</p>
        ) : (
          <div className="space-y-0">
            {data.events.map((event, i) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {i < data.events.length - 1 && <div className="w-0.5 h-full bg-gray-200 min-h-[40px]" />}
                </div>
                <div className="pb-4">
                  <p className="font-medium">{event.description}</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                  <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
