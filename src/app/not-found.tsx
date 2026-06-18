import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl font-bold text-amazon-orange mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Looking for something?</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We&apos;re sorry. The Web address you entered is not a functioning page on our site.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block bg-amazon-orange text-black px-6 py-2 rounded font-semibold hover:bg-yellow-500 transition"
          >
            Go to Evara&apos;s Home Page
          </Link>
          <p className="text-sm text-gray-500">
            Or try searching for what you need.
          </p>
        </div>
      </div>
    </div>
  );
}
