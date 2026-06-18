'use client';

import { useState, useEffect } from 'react';

export default function SellerKYCPage() {
  const [documents, setDocuments] = useState<Array<{ id: string; documentType: string; documentUrl: string; status: string; reviewNote?: string }>>([]);
  const [kycVerified, setKycVerified] = useState(false);
  const [documentType, setDocumentType] = useState('ID');
  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchKYC(); }, []);

  async function fetchKYC() {
    const res = await fetch('/api/seller/kyc');
    if (res.ok) {
      const data = await res.json();
      setDocuments(data.documents || []);
      setKycVerified(data.kycVerified || false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/seller/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentType, documentUrl }),
    });
    setDocumentUrl('');
    await fetchKYC();
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">KYC Verification</h1>
      <div className={`p-3 rounded mb-6 ${kycVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {kycVerified ? '✅ KYC Verified' : '⏳ KYC Pending Verification'}
      </div>

      <form onSubmit={submit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Document Type</label>
          <select value={documentType} onChange={e => setDocumentType(e.target.value)} className="border rounded p-2 w-full">
            <option value="ID">Government ID</option>
            <option value="BUSINESS_LICENSE">Business License</option>
            <option value="TAX_CERT">Tax Certificate</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Document URL</label>
          <input value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} className="border rounded p-2 w-full" placeholder="https://..." required />
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Uploading...' : 'Submit Document'}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-3">Submitted Documents</h2>
      <div className="space-y-3">
        {documents.map(doc => (
          <div key={doc.id} className="border rounded p-4">
            <div className="flex justify-between">
              <span className="font-medium">{doc.documentType}</span>
              <span className={`px-2 py-1 rounded text-sm ${doc.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {doc.status}
              </span>
            </div>
            {doc.reviewNote && <p className="text-sm text-gray-600 mt-1">Note: {doc.reviewNote}</p>}
          </div>
        ))}
        {documents.length === 0 && <p className="text-gray-500">No documents submitted yet.</p>}
      </div>
    </div>
  );
}
