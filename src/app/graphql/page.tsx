'use client';

import { useState } from 'react';

const DEFAULT_QUERY = `{
  products(limit: 5) {
    id
    name
    slug
    price
    rating
    reviewCount
  }
}`;

export default function GraphQLPlayground() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e: any) {
      setResult(JSON.stringify({ error: e.message }, null, 2));
    }
    setLoading(false);
  };

  if (process.env.NODE_ENV === 'production') {
    return <div className="p-8 text-center text-gray-500">Not available in production.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">GraphQL Playground</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Query</label>
          <textarea
            className="w-full h-96 p-3 border rounded font-mono text-sm bg-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={executeQuery}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Execute'}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Result</label>
          <pre className="w-full h-96 p-3 border rounded font-mono text-sm bg-white overflow-auto">
            {result || 'Click Execute to run query'}
          </pre>
        </div>
      </div>
    </div>
  );
}
