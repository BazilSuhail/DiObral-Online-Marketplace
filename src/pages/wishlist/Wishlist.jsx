import { motion } from "motion/react"
import { Link } from "react-router-dom"
import { FiStar, FiHeart, FiTrash2, FiShoppingBag, FiArrowRight, FiPackage, FiGrid } from "react-icons/fi"
import { FaStore } from "react-icons/fa6"
import { useQueryClient } from "@tanstack/react-query"
import { useWishlistStore } from "../../store/wishlistStore"
import { useAuthStore } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import { API_BASE_URL } from "../../api/client"
import Button from "../../components/ui/Button"

function buildImageUrl(image) {
  if (!image) return "/placeholder.png"
  if (image.startsWith("http")) return image
  return `${API_BASE_URL}/uploads/${image}`
}

function StarRating({ rating = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FiStar key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? "text-amber-400 fill-current" : "text-gray-200"}`} />
      ))}
    </div>
  )
}

export default function Wishlist() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)

  const { data: wishlist, isLoading: loadingProducts } = useApiQuery("/wishlist/products", null, {
    enabled: isAuthenticated,
    queryKey: ["wishlist", "products"],
  })
  const { data: stores, isLoading: loadingStores } = useApiQuery("/wishlist/stores", null, {
    enabled: isAuthenticated,
    queryKey: ["wishlist", "stores"],
  })

  const products = Array.isArray(wishlist) ? wishlist : []
  const followedStores = Array.isArray(stores) ? stores : []
  const totalSaved = products.length + followedStores.length

  const handleRemove = async (productId) => {
    await toggleWishlist(productId)
    queryClient.invalidateQueries({ queryKey: ["wishlist", "products"] })
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50/40 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
            <FiHeart className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to see your wishlist</h2>
          <p className="text-gray-500 mb-6 text-sm">Save your favorite products and stores</p>
          <Link to="/signin">
            <Button variant="red" size="lg">Sign In</Button>
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50/40 text-gray-800 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 mb-8"
        >
          <motion.svg
            initial={{ rotate: 0, scale: 0.8 }}
            animate={{ rotate: 360, scale: 1 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 text-red-200/60 -translate-y-1/4 translate-x-1/4 hidden sm:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <path d="M45.3,-68.5C58.2,-60.1,68.2,-46.2,74.7,-30.8C81.2,-15.4,84.2,1.5,78.9,15.3C73.6,29.1,60.1,39.9,45.5,49.5C30.9,59.1,15.4,67.6,0.2,67.3C-15.1,67,-30.1,58,-42.7,47C-55.3,36,-65.5,23,-70.3,7.2C-75.1,-8.6,-74.5,-27.1,-65.5,-40.8C-56.5,-54.5,-39.1,-63.3,-22.8,-69.4C-6.6,-75.5,8.6,-79,22.4,-75.2C36.2,-71.4,32.5,-76.9,45.3,-68.5Z" transform="translate(100 100)" />
          </motion.svg>
          <motion.svg
            initial={{ rotate: 0, scale: 0.8 }}
            animate={{ rotate: -360, scale: 1 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-40 h-40 sm:w-56 sm:h-56 text-rose-300/60 translate-y-1/3 -translate-x-1/4 hidden sm:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <path d="M39.9,-56.2C52.1,-50.1,62.6,-39.1,68.5,-26.2C74.4,-13.3,75.7,1.6,70.2,13.6C64.8,25.6,52.5,34.8,39.8,42.8C27.1,50.9,13.5,57.9,0.2,57.6C-13.2,57.2,-26.4,49.6,-36.7,40.1C-47,30.6,-54.4,19.2,-57.8,6.8C-61.3,-5.6,-60.8,-19,-55.2,-30.3C-49.7,-41.6,-39.2,-50.8,-27.2,-56.6C-15.2,-62.4,-7.6,-64.9,3.6,-68.5C14.7,-72.1,27.7,-62.3,39.9,-56.2Z" transform="translate(100 100)" />
          </motion.svg>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <FiHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">All your saved products and followed stores in one place</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none flex items-center gap-1.5 sm:gap-2.5 bg-red-50 rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5">
                <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <div>
                  <p className="text-base sm:text-xl font-bold text-gray-900 leading-none">{products.length}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-wider">Liked</p>
                </div>
              </div>
              <div className="flex-1 sm:flex-none flex items-center gap-1.5 sm:gap-2.5 bg-red-50 rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5">
                <FaStore className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <div>
                  <p className="text-base sm:text-xl font-bold text-gray-900 leading-none">{followedStores.length}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-wider">Followed</p>
                </div>
              </div>
              <div className="flex-1 sm:flex-none flex items-center gap-1.5 sm:gap-2.5 bg-red-50 rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5">
                <FiGrid className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <div>
                  <p className="text-base sm:text-xl font-bold text-gray-900 leading-none">{totalSaved}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-wider">Saved</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiShoppingBag className="w-5 h-5 text-red-500" /> Products
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{products.length}</span>
              </h2>
            </div>

            <div className="p-6">
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="aspect-[4/5] bg-gray-100" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-center">
                    <FiPackage className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-bold text-base">No wishlisted products yet</p>
                  <p className="text-xs text-gray-400 mt-1 mb-5">Start browsing and save your favorites</p>
                  <Link to="/productlist/all">
                    <Button variant="red">Browse Products <FiArrowRight className="ml-2 inline" /></Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
                    >
                      <Link to={`/products/${product._id}`} className="block relative">
                        <div className="aspect-[4/5] bg-gray-50 overflow-hidden">
                          <img
                            src={buildImageUrl(product.image)}
                            alt={product.name || "Product image"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = "/placeholder.png" }}
                          />
                        </div>
                        {product.sale != null && product.price != null && product.sale > 0 && product.sale < 100 && (
                          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            -{Math.round(product.sale)}%
                          </span>
                        )}
                      </Link>
                      <div className="p-4">
                        <Link to={`/products/${product._id}`}>
                          <h3 className="font-bold text-gray-900 text-sm truncate hover:text-red-600 transition-colors">{product.name || "Untitled Product"}</h3>
                        </Link>
                        {product.rating != null && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <StarRating rating={product.rating} />
                            <span className="text-[10px] text-gray-400 font-medium">({Number(product.rating).toFixed(1)})</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div>
                            {product.sale != null && product.price != null && product.sale > 0 && product.sale < 100 ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900">Rs. {Number(product.price * (1 - product.sale / 100)).toFixed(0)}</span>
                                <span className="text-[11px] text-gray-400 line-through">Rs. {Number(product.price).toFixed(0)}</span>
                              </div>
                            ) : product.price != null ? (
                              <span className="font-bold text-gray-900">Rs. {Number(product.price).toFixed(0)}</span>
                            ) : null}
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); handleRemove(product._id) }}
                            className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center hover:bg-rose-100 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </section>

        <section>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaStore className="w-5 h-5 text-red-500" /> Followed Stores
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{followedStores.length}</span>
              </h2>
            </div>

            <div className="p-6">
              {loadingStores ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-100 rounded w-2/3" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : followedStores.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-center">
                    <FaStore className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-bold text-base">No stores followed yet</p>
                  <p className="text-xs text-gray-400 mt-1">Explore stores and follow your favorites</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {followedStores.map((store, i) => (
                    <motion.div
                      key={store._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 group"
                    >
                      <Link to={`/stores/${store.slug || store._id}`} className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                          {store.logo ? (
                            <img src={buildImageUrl(store.logo)} alt={store.storeName || "Store"} className="w-full h-full object-cover" />
                          ) : (
                            <FaStore className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{store.storeName || "Unnamed Store"}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {store.rating != null && (
                              <>
                                <StarRating rating={store.rating} />
                                <span className="text-[10px] text-gray-400 font-medium">
                                  ({store.ratingCount != null ? store.ratingCount : Number(store.rating).toFixed(1)})
                                </span>
                              </>
                            )}
                            {store.productCount != null && (
                              <span className="text-[10px] text-gray-400 ml-auto">{store.productCount} products</span>
                            )}
                          </div>
                          {store.description && (
                            <p className="text-[11px] text-gray-400 truncate mt-1">{store.description}</p>
                          )}
                        </div>
                        <FiArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-red-500 transition-colors" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}