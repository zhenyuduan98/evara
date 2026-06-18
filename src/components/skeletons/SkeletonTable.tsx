export default function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      <div className="grid grid-cols-5 gap-4 p-3 bg-gray-100 rounded">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-300 h-4 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 p-3 border-b">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="bg-gray-200 h-4 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
