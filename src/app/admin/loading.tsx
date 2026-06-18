import SkeletonTable from '@/components/skeletons/SkeletonTable';
export default function Loading() {
  return <div className="p-6"><SkeletonTable rows={8} /></div>;
}
