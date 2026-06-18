'use client';

import { useState } from 'react';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1, 6).map(line => {
        const vals = line.split(',').map(v => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      });
      setPreview(rows);
    };
    reader.readAsText(f);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const res = await fetch('/api/seller/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text,
      });
      const data = await res.json();
      setResult(data.data || { success: 0, errors: ['Upload failed'] });
    } catch { setResult({ success: 0, errors: ['Network error'] }); }
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Bulk Product Upload</h1>
      <p className="text-gray-500 mb-6">Upload a CSV file with your products. Required columns: title, description, brand, price, sku</p>

      <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
        <div className="bg-gray-50 border-2 border-dashed rounded-lg p-8 text-center">
          <input type="file" accept=".csv" onChange={handleFile} className="mx-auto" />
          <p className="text-sm text-gray-400 mt-2">CSV format only</p>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
          <h2 className="font-bold mb-3">Preview (first 5 rows)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>{Object.keys(preview[0]).map(h => <th key={h} className="text-left p-2 border-b font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="p-2 border-b">{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={upload} disabled={uploading} className="mt-4 bg-amazon-orange text-white px-6 py-2 rounded font-medium hover:bg-orange-500 disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload Products'}
          </button>
        </div>
      )}

      {result && (
        <div className={`border rounded-lg p-4 ${result.errors.length ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
          <p className="font-bold">{result.success} products uploaded successfully</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">CSV Template</h3>
        <code className="text-sm text-blue-700 block">title,description,brand,price,sku,bulletPoints</code>
        <code className="text-sm text-blue-700 block">Wireless Mouse,Ergonomic wireless mouse,TechBrand,29.99,WM-001,&quot;Ergonomic|2.4GHz|Long battery&quot;</code>
      </div>
    </div>
  );
}
