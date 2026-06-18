'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface DigitalItem {
  id: string;
  orderItemId: string;
  productId: string;
  downloadUrl: string;
  licenseKey: string | null;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: string | null;
  orderItem: { title: string; imageUrl: string | null };
}

export default function OrderDownloadsPage() {
  const params = useParams();
  const [items, setItems] = useState<DigitalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}/downloads`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleDownload = async (itemId: string) => {
    const res = await fetch(`/api/orders/${params.id}/items/${itemId}/download`, {
      method: 'POST',
    });
    const data = await res.json();
    if (data.downloadUrl) {
      window.open(data.downloadUrl, '_blank');
    } else {
      alert(data.error || 'Download failed');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Digital Downloads</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">No digital items in this order.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{item.orderItem.title}</h3>
                {item.licenseKey && (
                  <p className="text-sm text-gray-500">License: {item.licenseKey}</p>
                )}
                <p className="text-sm text-gray-500">
                  Downloads: {item.downloadCount}/{item.maxDownloads}
                </p>
                {item.expiresAt && (
                  <p className="text-sm text-gray-500">
                    Expires: {new Date(item.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDownload(item.orderItemId)}
                disabled={item.downloadCount >= item.maxDownloads}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
