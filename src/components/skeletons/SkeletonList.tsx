export default function SkeletonList({ items = 4 }: { items?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <div className="bg-gray-200 w-16 h-16 rounded" />
          <div className="flex-1 space-y-2">
            <div className="bg-gray-200 h-4 rounded w-3/4" />
            <div className="bg-gray-200 h-4 rounded w-1/2" />
          </div>
          <div className="bg-gray-200 h-6 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}
