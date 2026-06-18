'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ textAlign: 'center', maxWidth: 500, padding: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: '#666', marginBottom: 24 }}>A critical error occurred. Please try again.</p>
            <button
              onClick={reset}
              style={{ background: '#f90', border: 'none', padding: '10px 24px', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
