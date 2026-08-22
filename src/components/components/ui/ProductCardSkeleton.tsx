export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#ECECEC] shadow-sm" style={{ height: '420px' }}>
      {/* Image Skeleton */}
      <div className="h-[65%] bg-[#F5F5F5] animate-pulse" />
      
      {/* Product Info Skeleton */}
      <div className="h-[35%] p-5 flex flex-col justify-between">
        <div>
          {/* Rating Skeleton */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-20 h-4 bg-[#ECECEC] rounded animate-pulse" />
            <div className="w-8 h-4 bg-[#ECECEC] rounded animate-pulse" />
          </div>
          
          {/* Title Skeleton */}
          <div className="w-full h-5 bg-[#ECECEC] rounded animate-pulse mb-2" />
          <div className="w-3/4 h-5 bg-[#ECECEC] rounded animate-pulse mb-3" />
        </div>
        
        {/* Price Skeleton */}
        <div className="flex items-baseline gap-2 mb-3">
          <div className="w-24 h-6 bg-[#ECECEC] rounded animate-pulse" />
          <div className="w-16 h-4 bg-[#ECECEC] rounded animate-pulse" />
        </div>
        
        {/* Button Skeleton */}
        <div className="w-full h-12 bg-[#ECECEC] rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
