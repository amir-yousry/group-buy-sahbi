export function GroupCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-4 skeleton w-1/2" />
        <div className="h-7 skeleton w-2/5" />
        <div className="h-2 skeleton w-full" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full skeleton" />
            <div className="h-3 skeleton w-20" />
          </div>
          <div className="h-3 skeleton w-12" />
        </div>
      </div>
    </div>
  );
}
