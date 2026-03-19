import { motion } from "motion/react"

const ProductDetailSkeleton = () => {
  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 pt-4">
      {/* Breadcrumb Skeleton */}
      <section className="mb-4">
        <div className="flex items-center space-x-2 text-sm">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <motion.div
                className="h-4 w-16 bg-gray-200 rounded"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: i * 0.1
                }}
              />
              {i < 2 && <div className="h-4 w-2 bg-gray-200 rounded" />}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images Skeleton */}
        <div className="space-y-4">
          <motion.div
            className="relative aspect-[4/5] bg-gray-200 w-full rounded-lg overflow-hidden"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0.8 }}
            transition={{ 
              repeat: Infinity, 
              duration: 1, 
              repeatType: "reverse"
            }}
          >
            {/* Navigation buttons placeholder */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full"></div>
          </motion.div>

          {/* Thumbnail Images Skeleton */}
          <div className="flex space-x-2">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-200 border-2 border-gray-200"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-6">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badges */}
            <div className="flex gap-2">
              <motion.div 
                className="h-6 w-16 bg-gray-200 rounded"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse"
                }}
              />
              <motion.div 
                className="h-6 w-16 bg-gray-200 rounded"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: 0.2
                }}
              />
            </div>

            {/* Title */}
            <motion.div 
              className="h-8 w-3/4 bg-gray-200 rounded"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0.8 }}
              transition={{ 
                repeat: Infinity, 
                duration: 1, 
                repeatType: "reverse",
                delay: 0.1
              }}
            />

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-5 h-5 bg-gray-200 rounded mr-1"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1, 
                      repeatType: "reverse",
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
              <motion.div 
                className="h-4 w-16 bg-gray-200 rounded"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: 0.3
                }}
              />
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <motion.div 
                className="h-8 w-24 bg-gray-200 rounded"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: 0.1
                }}
              />
              <motion.div 
                className="h-6 w-20 bg-gray-200 rounded"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: 0.2
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-4 bg-gray-200 rounded ${i === 3 ? 'w-2/3' : 'w-full'}`}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    repeatType: "reverse",
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Product Options Skeleton */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Size Selection */}
            <div>
              <motion.div 
                className="h-5 w-16 bg-gray-200 rounded mb-3"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse"
                }}
              />
              <motion.div 
                className="w-full h-10 bg-gray-200 rounded"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: 0.1
                }}
              />
            </div>

            {/* Quantity */}
            <div>
              <motion.div 
                className="h-5 w-16 bg-gray-200 rounded mb-3"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse"
                }}
              />
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 bg-gray-200 rounded-full"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    repeatType: "reverse",
                    delay: 0.1
                  }}
                />
                <motion.div 
                  className="w-8 h-10 bg-gray-200 rounded"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    repeatType: "reverse",
                    delay: 0.2
                  }}
                />
                <motion.div 
                  className="w-10 h-10 bg-gray-200 rounded-full"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    repeatType: "reverse",
                    delay: 0.3
                  }}
                />
              </div>
              <motion.div 
                className="h-4 w-32 bg-gray-200 rounded mt-2"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: 0.2
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.div 
                className="w-[280px] h-12 bg-gray-200 rounded"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: 0.1
                }}
              />
              <motion.div 
                className="w-12 h-12 bg-gray-200 rounded"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  repeatType: "reverse",
                  delay: 0.2
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section Skeleton */}
      <div className="mt-12 space-y-6">
        <motion.div 
          className="h-8 w-48 bg-gray-200 rounded"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0.8 }}
          transition={{ 
            repeat: Infinity, 
            duration: 1, 
            repeatType: "reverse"
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="p-4 bg-white rounded-lg border border-gray-200"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0.8 }}
              transition={{ 
                repeat: Infinity, 
                duration: 1, 
                repeatType: "reverse",
                delay: i * 0.1
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-4/5 bg-gray-200 rounded"></div>
                <div className="h-3 w-3/5 bg-gray-200 rounded"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default ProductDetailSkeleton
