export default function MaintenancePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-4">🔧</div>
        <h1 className="text-3xl font-bold mb-3">We&apos;ll be right back</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We&apos;re currently performing scheduled maintenance. Please check back shortly.
        </p>
        <p className="text-sm text-gray-400">
          If you need immediate assistance, please contact support.
        </p>
      </div>
    </div>
  );
}
