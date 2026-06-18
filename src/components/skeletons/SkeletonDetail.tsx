export default function SkeletonDetail() {
  return (
    <div className="animate-pulse max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-gray-200 h-96 rounded" />
      <div className="space-y-4">
        <div className="bg-gray-200 h-8 rounded w-3/4" />
        <div className="bg-gray-200 h-4 rounded w-1/2" />
        <div className="bg-gray-200 h-6 rounded w-1/4" />
        <div className="bg-gray-200 h-24 rounded" />
        <div className="bg-gray-200 h-12 rounded w-1/3" />
      </div>
    </div>
  );
}
