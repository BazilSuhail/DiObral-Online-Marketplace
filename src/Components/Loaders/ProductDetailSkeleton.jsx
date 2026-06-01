const Block = ({ className = "" }) => <div className={`soft-skeleton ${className}`} />

const Card = ({ children, className = "" }) => (
  <div className={`soft-card rounded-3xl p-5 sm:p-7 ${className}`}>{children}</div>
)

const ProductDetailSkeleton = () => {
  return (
    <main className="soft-page" aria-busy="true" aria-label="Loading product">
      <div className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 lg:mb-6">
          <Block className="h-4 w-14" />
          <Block className="h-4 w-16" />
          <Block className="h-4 w-24" />
          <Block className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">
          {/* Gallery */}
          <div className="-mx-4 sm:-mx-6 lg:col-span-7 lg:mx-0">
            <div className="flex gap-4">
              <div className="hidden w-20 shrink-0 flex-col gap-3 lg:flex">
                {[...Array(5)].map((_, i) => (
                  <Block key={i} className="aspect-4/5 w-full !rounded-2xl" />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <Block className="aspect-4/5 w-full !rounded-b-3xl !rounded-t-none lg:!rounded-3xl" />
                <div className="mt-3 flex justify-center gap-1.5 lg:hidden">
                  {[...Array(4)].map((_, i) => (
                    <Block key={i} className="h-1.5 w-1.5 !rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <Block className="h-7 w-28 !rounded-full" />
                <Block className="h-4 w-20" />
              </div>
              <Block className="h-8 w-4/5" />
              <Block className="h-4 w-48" />
              <Block className="h-9 w-40" />
              <div className="space-y-2">
                <Block className="h-4 w-full" />
                <Block className="h-4 w-full" />
                <Block className="h-4 w-2/3" />
              </div>
            </Card>

            <Card className="space-y-5">
              <Block className="h-4 w-24" />
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <Block key={i} className="h-12 w-12 !rounded-2xl" />
                ))}
              </div>
              <div className="flex gap-3">
                <Block className="h-14 w-32 !rounded-2xl" />
                <Block className="h-14 flex-1 !rounded-2xl" />
              </div>
              <Block className="h-16 w-full !rounded-2xl" />
              <Block className="h-4 w-56" />
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <Block className="h-12 w-12 !rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Block className="h-3 w-16" />
                  <Block className="h-4 w-32" />
                </div>
                <Block className="h-10 w-28 !rounded-2xl" />
              </div>
            </Card>

            <Card>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Block className="h-8 w-8 !rounded-full sm:h-10 sm:w-10" />
                    <Block className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Reviews */}
        <Card className="mt-8 space-y-5 lg:mt-10">
          <Block className="h-7 w-56" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="soft-card-inset space-y-3 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Block className="h-10 w-10 !rounded-full" />
                  <div className="space-y-1.5">
                    <Block className="h-4 w-32" />
                    <Block className="h-3 w-24" />
                  </div>
                </div>
                <Block className="h-3 w-full" />
                <Block className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  )
}

export default ProductDetailSkeleton
