export default function ProductPageLoading() {
  return (
    <div className="page-enter">
      <div className="border-b border-border">
        <div className="container-main py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="skeleton h-4 w-16 rounded" />
            <span>/</span>
            <div className="skeleton h-4 w-16 rounded" />
            <span>/</span>
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        </div>
      </div>

      <div className="container-main py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-16">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square skeleton rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square skeleton rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
            
            <div className="flex items-baseline gap-3">
              <div className="skeleton h-8 w-32 rounded" />
              <div className="skeleton h-6 w-24 rounded" />
            </div>

            <div className="space-y-3">
              <div className="skeleton h-12 w-full rounded" />
              <div className="skeleton h-12 w-full rounded" />
              <div className="skeleton h-12 w-3/4 rounded" />
            </div>

            <div className="space-y-3 pt-4">
              <div className="skeleton h-12 w-full rounded" />
              <div className="skeleton h-12 w-full rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Skeleton */}
      <div className="border-t border-border">
        <div className="container-main py-12">
          <div className="skeleton h-10 w-48 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
