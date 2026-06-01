const ProductListingSkeleton = () => {
  return (
    <div className="soft-page">
      <div className="flex gap-8">
        {/* Filters Sidebar Skeleton */}
        <div className="hidden lg:block lg:w-64 space-y-6">
          <div className="soft-card rounded-3xl p-6">
            <div className="soft-skeleton h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="soft-skeleton h-4 w-4" />
                  <div className="soft-skeleton h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="soft-card rounded-3xl p-6">
            <div className="soft-skeleton h-6 w-32 mb-4" />
            <div className="space-y-4">
              <div className="soft-skeleton h-2 w-full" />
              <div className="flex items-center justify-between">
                <div className="soft-skeleton h-4 w-12" />
                <div className="soft-skeleton h-4 w-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="flex-1">
          <div className="soft-skeleton h-5 w-48 mb-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(18)].map((_, index) => (
              <div key={index} className="soft-card rounded-3xl overflow-hidden">
                <div className="soft-skeleton aspect-square w-full rounded-none" />
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="soft-skeleton w-4 h-4 mr-1" />
                    ))}
                    <div className="soft-skeleton h-3 w-8 ml-2" />
                  </div>
                  <div className="soft-skeleton h-5 w-3/4 mb-2" />
                  <div className="soft-skeleton h-4 w-1/2 mb-2" />
                  <div className="soft-skeleton h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductListingSkeleton
