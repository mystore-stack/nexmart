// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="container-main py-12">
      <div className="space-y-8">
        {/* Hero skeleton */}
        <div className="skeleton h-[420px] rounded-2xl" />
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/50">
              <div className="aspect-square skeleton" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 rounded w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
                <div className="skeleton h-5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
