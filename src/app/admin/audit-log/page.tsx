'use client';

import { useEffect, useState } from 'react';

interface AuditLog {
  id: string;
  action: string;
  target: string;
  targetId?: string;
  details?: any;
  ip?: string;
  createdAt: string;
  admin: { name: string | null; email: string | null };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/audit-log?page=${page}&limit=30`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Audit Log</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Admin</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Target</th>
                <th className="text-left p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3">{log.admin.name || log.admin.email}</td>
                  <td className="p-3 font-mono text-xs">{log.action}</td>
                  <td className="p-3">{log.target}{log.targetId ? ` #${log.targetId.slice(0, 8)}` : ''}</td>
                  <td className="p-3 text-xs max-w-xs truncate">{log.details ? JSON.stringify(log.details) : '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-gray-500">No audit logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <span className="px-3 py-1">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
