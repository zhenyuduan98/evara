export default function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-4 space-y-3">
      <div className="bg-gray-200 h-48 rounded" />
      <div className="bg-gray-200 h-4 rounded w-3/4" />
      <div className="bg-gray-200 h-4 rounded w-1/2" />
      <div className="bg-gray-200 h-6 rounded w-1/4" />
    </div>
  );
}
