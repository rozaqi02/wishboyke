import React from 'react';

/**
 * Skeleton loader for Product Cards matching the exact layout of ProductCard.
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs animate-pulse">
      {/* Thumbnail placeholder */}
      <div className="relative aspect-[4/5] sm:aspect-square w-full bg-gray-200">
        <div className="absolute inset-0 animate-shimmer" />
      </div>

      {/* Content placeholder */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-2">
          {/* BPOM & Rating row */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-gray-200 rounded-sm" />
            <div className="h-3 w-10 bg-gray-200 rounded-sm" />
          </div>

          {/* Title */}
          <div className="h-4 bg-gray-200 rounded-sm w-full" />
          <div className="h-4 bg-gray-200 rounded-sm w-3/4" />

          {/* Subtitle / indication */}
          <div className="h-3 bg-gray-100 rounded-sm w-1/2 pt-1" />
        </div>

        {/* Price & button */}
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="h-4 sm:h-5 w-20 bg-gray-200 rounded-sm" />
            <div className="h-2.5 w-14 bg-gray-100 rounded-sm" />
          </div>
          <div className="h-8 w-8 sm:w-20 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of ProductCardSkeletons
 */
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Category cards
 */
export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl overflow-hidden aspect-[4/3] bg-gray-200 border border-gray-100 relative animate-pulse">
      <div className="absolute inset-0 animate-shimmer" />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 space-y-1.5">
        <div className="h-4 w-28 bg-gray-300 rounded-sm" />
        <div className="h-3 w-40 bg-gray-300/70 rounded-sm" />
      </div>
    </div>
  );
};

/**
 * Skeleton for ProductDetail page
 */
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-6 sm:py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-10 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-3.5 w-56 bg-stone-200 rounded-sm" />

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-square sm:aspect-[4/5] bg-stone-200 border border-[#EDE8E1] rounded-none sm:rounded-md relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer" />
            </div>
            <div className="flex gap-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-200 border border-[#EDE8E1]" />
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-5 space-y-5">
            <div className="h-3.5 w-40 bg-stone-200 rounded-sm" />
            <div className="h-8 sm:h-10 bg-stone-300 rounded-sm w-3/4" />
            <div className="h-4 bg-stone-200 rounded-sm w-full" />
            <div className="h-4 bg-stone-200 rounded-sm w-2/3" />
            <div className="h-4 bg-stone-200 rounded-sm w-1/2" />
            <div className="h-8 bg-stone-200 rounded-sm w-36 py-2" />

            <div className="pt-4 space-y-3">
              <div className="flex gap-3">
                <div className="h-12 w-36 bg-stone-200 rounded-full" />
                <div className="h-12 flex-1 bg-stone-300 rounded-full" />
              </div>
              <div className="h-12 w-full bg-stone-200 rounded-full" />
            </div>

            <div className="pt-6 border-t border-[#EDE8E1] space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-stone-100 rounded-sm border-b border-[#EDE8E1]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
