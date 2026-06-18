'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We&apos;re sorry, an unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-amazon-orange text-black px-6 py-2 rounded font-semibold hover:bg-yellow-500 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
