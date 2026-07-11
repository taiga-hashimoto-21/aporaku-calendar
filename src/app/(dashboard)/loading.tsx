export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-40 rounded shimmer" />
        <div className="h-5 w-28 rounded shimmer" />
      </div>
      <div className="rounded-lg bg-white p-6 space-y-4">
        <div className="h-4 w-3/4 max-w-md rounded shimmer" />
        <div className="h-4 w-1/2 max-w-sm rounded shimmer" />
        <div className="mt-6 space-y-3">
          <div className="h-16 w-full rounded-lg shimmer" />
          <div className="h-16 w-full rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}
