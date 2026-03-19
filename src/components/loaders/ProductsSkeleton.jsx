import { motion } from "motion/react"

const ProductListingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
    
        <div className="flex gap-8">
          {/* Filters Sidebar Skeleton */}
          <div className="hidden lg:block lg:w-64 space-y-6">
            <div className="bg-white border-[2px] border-gray-100 shadow-sm rounded-[14px] p-6">
              <motion.div 
                className="h-6 w-32 bg-gray-200 rounded mb-4"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
              />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        className="h-4 w-4 bg-gray-200 rounded"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ repeat: Infinity, duration: 1, repeatType: "reverse", delay: i * 0.1 }}
                      />
                      <motion.div 
                        className="h-4 w-24 bg-gray-200 rounded"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ repeat: Infinity, duration: 1, repeatType: "reverse", delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border-[2px] border-gray-100 shadow-sm rounded-[14px] p-6">
              <motion.div 
                className="h-6 w-32 bg-gray-200 rounded mb-4"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: "reverse", delay: 0.2 }}
              />
              <div className="space-y-4">
                <motion.div 
                  className="h-2 bg-gray-200 rounded w-full"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ repeat: Infinity, duration: 1, repeatType: "reverse", delay: 0.3 }}
                />
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="h-4 w-12 bg-gray-200 rounded"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ repeat: Infinity, duration: 1, repeatType: "reverse", delay: 0.4 }}
                  />
                  <motion.div 
                    className="h-4 w-12 bg-gray-200 rounded"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ repeat: Infinity, duration: 1, repeatType: "reverse", delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            <motion.div 
              className="h-5 w-48 bg-gray-200 rounded mb-4"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0.8 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            />

            {/* Grid View Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(18)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    repeatType: "reverse",
                    delay: index * 0.1
                  }}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    <div className="relative aspect-square bg-gray-200"></div>
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
                          ))}
                        </div>
                        <div className="h-3 w-8 bg-gray-200 rounded ml-2"></div>
                      </div>
                      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductListingSkeleton
