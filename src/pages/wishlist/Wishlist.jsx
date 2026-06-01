import { motion, useReducedMotion } from "motion/react"
import { Link } from "react-router-dom"
import {
  FiStar, FiHeart, FiTrash2, FiShoppingBag, FiArrowRight, FiGrid, FiLogIn, FiUsers, FiPackage,
  FiTag, FiChevronRight, FiUserCheck,
} from "react-icons/fi"
import { useQueryClient } from "@tanstack/react-query"
import { useWishlistStore } from "../../store/wishlistStore"
import { useAuthStore } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import { API_BASE_URL } from "../../api/client"
import { EmptyWishlist, NoFollowedStores, SignInRequired } from "../../components/illustrations"

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
  const reduce = useReducedMotion()
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

  const enterY = reduce ? 0 : 20

  if (!isAuthenticated) {
    return (
      <main className="soft-page flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: enterY }} animate={{ opacity: 1, y: 0 }} className="soft-card rounded-3xl mx-auto max-w-lg w-full px-6 py-12 flex flex-col items-center text-center">
          <SignInRequired size={200} className="mb-6" />
          <h2 className="text-xl font-semibold text-gray-900">Sign in to see your wishlist</h2>
          <p className="mt-2 text-sm text-gray-500">Save your favorite products and stores</p>
          <Link to="/signin" className="soft-btn soft-btn-primary mt-6"><FiLogIn className="h-4 w-4" />Sign In<FiArrowRight className="h-4 w-4" /></Link>
        </motion.div>
      </main>
    )
  }

  const statTile = "flex-1 sm:flex-none soft-card-inset rounded-2xl flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5"

  return (
    <main className="soft-page text-gray-800 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        <motion.div
          initial={{ opacity: 0, y: enterY }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8"
        >
          <motion.svg
            initial={{ rotate: 0, scale: 0.8 }}
            animate={reduce ? { scale: 1 } : { rotate: 360, scale: 1 }}
            transition={{ duration: 60, repeat: reduce ? 0 : Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 text-red-200/60 -translate-y-1/4 translate-x-1/4 hidden sm:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <path d="M45.3,-68.5C58.2,-60.1,68.2,-46.2,74.7,-30.8C81.2,-15.4,84.2,1.5,78.9,15.3C73.6,29.1,60.1,39.9,45.5,49.5C30.9,59.1,15.4,67.6,0.2,67.3C-15.1,67,-30.1,58,-42.7,47C-55.3,36,-65.5,23,-70.3,7.2C-75.1,-8.6,-74.5,-27.1,-65.5,-40.8C-56.5,-54.5,-39.1,-63.3,-22.8,-69.4C-6.6,-75.5,8.6,-79,22.4,-75.2C36.2,-71.4,32.5,-76.9,45.3,-68.5Z" transform="translate(100 100)" />
          </motion.svg>
          <motion.svg
            initial={{ rotate: 0, scale: 0.8 }}
            animate={reduce ? { scale: 1 } : { rotate: -360, scale: 1 }}
            transition={{ duration: 50, repeat: reduce ? 0 : Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-40 h-40 sm:w-56 sm:h-56 text-rose-300/60 translate-y-1/3 -translate-x-1/4 hidden sm:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <path d="M39.9,-56.2C52.1,-50.1,62.6,-39.1,68.5,-26.2C74.4,-13.3,75.7,1.6,70.2,13.6C64.8,25.6,52.5,34.8,39.8,42.8C27.1,50.9,13.5,57.9,0.2,57.6C-13.2,57.2,-26.4,49.6,-36.7,40.1C-47,30.6,-54.4,19.2,-57.8,6.8C-61.3,-5.6,-60.8,-19,-55.2,-30.3C-49.7,-41.6,-39.2,-50.8,-27.2,-56.6C-15.2,-62.4,-7.6,-64.9,3.6,-68.5C14.7,-72.1,27.7,-62.3,39.9,-56.2Z" transform="translate(100 100)" />
          </motion.svg>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-3 mb-2">
                <span className="soft-icon-tile flex-shrink-0">
                  <FiHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <h1 className="text-xl sm:text-3xl font-semibold text-gray-900">My Wishlist</h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">All your saved products and followed stores in one place</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className={statTile}>
                <FiHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <div>
                  <p className="text-base sm:text-xl font-semibold text-gray-900 leading-none">{products.length}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-wide">Liked</p>
                </div>
              </div>
              <div className={statTile}>
                <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <div>
                  <p className="text-base sm:text-xl font-semibold text-gray-900 leading-none">{followedStores.length}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-wide">Followed</p>
                </div>
              </div>
              <div className={statTile}>
                <FiGrid className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <div>
                  <p className="text-base sm:text-xl font-semibold text-gray-900 leading-none">{totalSaved}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-wide">Saved</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="soft-card rounded-3xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="soft-section-title text-lg font-semibold text-gray-900">
                <span className="soft-icon-tile soft-icon-tile-sm"><FiShoppingBag className="w-4 h-4" /></span> Products
                <span className="soft-badge soft-badge-neutral">{products.length}</span>
              </h2>
            </div>

            <div className="p-6">
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="soft-card rounded-3xl overflow-hidden">
                      <div className="soft-skeleton aspect-[4/5] w-full" />
                      <div className="p-4 space-y-3">
                        <div className="soft-skeleton h-4 w-3/4" />
                        <div className="soft-skeleton h-3 w-1/2" />
                        <div className="soft-skeleton h-4 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="soft-panel rounded-3xl mx-auto max-w-lg px-6 py-12 flex flex-col items-center text-center">
                  <EmptyWishlist size={200} className="mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900">No wishlisted products yet</h3>
                  <p className="mt-2 text-sm text-gray-500">Start browsing and save your favorites</p>
                  <Link to="/productlist/all" className="soft-btn soft-btn-primary mt-6"><FiShoppingBag className="h-4 w-4" />Browse Products<FiArrowRight className="h-4 w-4" /></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: enterY }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : i * 0.05 }}
                      className="soft-card soft-card-hover rounded-3xl overflow-hidden group"
                    >
                      <Link to={`/products/${product._id}`} className="block relative">
                        <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                          <img
                            src={buildImageUrl(product.image)}
                            alt={product.name || "Product image"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = "/placeholder.png" }}
                          />
                        </div>
                        {product.sale != null && product.price != null && product.sale > 0 && product.sale < 100 && (
                          <span className="soft-badge soft-badge-sale absolute top-3 left-3">
                            <FiTag className="w-3 h-3" />-{Math.round(product.sale)}%
                          </span>
                        )}
                      </Link>
                      <div className="p-4">
                        <Link to={`/products/${product._id}`}>
                          <h3 className="font-semibold text-gray-900 text-sm truncate hover:text-red-600 transition-colors">{product.name || "Untitled Product"}</h3>
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
                                <span className="font-semibold text-red-600 whitespace-nowrap">Rs. {Number(product.price * (1 - product.sale / 100)).toFixed(0)}</span>
                                <span className="text-[11px] text-gray-400 line-through whitespace-nowrap">Rs. {Number(product.price).toFixed(0)}</span>
                              </div>
                            ) : product.price != null ? (
                              <span className="font-semibold text-gray-900 whitespace-nowrap">Rs. {Number(product.price).toFixed(0)}</span>
                            ) : null}
                          </div>
                          <motion.button
                            whileTap={reduce ? undefined : { scale: 0.85 }}
                            aria-label="Remove from wishlist"
                            onClick={(e) => { e.preventDefault(); handleRemove(product._id) }}
                            className="soft-icon-btn text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
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
            initial={{ opacity: 0, y: reduce ? 0 : 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reduce ? 0 : 0.1 }}
            className="soft-card rounded-3xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="soft-section-title text-lg font-semibold text-gray-900">
                <span className="soft-icon-tile soft-icon-tile-sm"><FiUsers className="w-4 h-4" /></span> Followed Stores
                <span className="soft-badge soft-badge-neutral">{followedStores.length}</span>
              </h2>
            </div>

            <div className="p-6">
              {loadingStores ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="soft-card rounded-3xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="soft-skeleton w-14 h-14 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                          <div className="soft-skeleton h-4 w-2/3" />
                          <div className="soft-skeleton h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : followedStores.length === 0 ? (
                <div className="soft-panel rounded-3xl mx-auto max-w-lg px-6 py-12 flex flex-col items-center text-center">
                  <NoFollowedStores size={200} className="mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900">No stores followed yet</h3>
                  <p className="mt-2 text-sm text-gray-500">Explore stores and follow your favorites</p>
                  <Link to="/stores" className="soft-btn soft-btn-secondary mt-6"><FiUserCheck className="h-4 w-4" />Explore Stores<FiArrowRight className="h-4 w-4" /></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {followedStores.map((store, i) => (
                    <motion.div
                      key={store._id}
                      initial={{ opacity: 0, y: enterY }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : i * 0.05 }}
                      className="soft-card soft-card-hover rounded-3xl p-5 group"
                    >
                      <Link to={`/stores/${store.slug || store._id}`} className="flex items-center gap-4">
                        <div className="soft-icon-tile soft-icon-tile-lg soft-icon-tile-gray rounded-2xl flex-shrink-0 overflow-hidden ring-1 ring-gray-200/60">
                          {store.logo ? (
                            <img src={buildImageUrl(store.logo)} alt={store.storeName || "Store"} className="w-full h-full object-cover" />
                          ) : (
                            <FiShoppingBag className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{store.storeName || "Unnamed Store"}</h3>
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
                              <span className="soft-badge soft-badge-neutral ml-auto"><FiPackage className="w-3 h-3" />{store.productCount}</span>
                            )}
                          </div>
                          {store.description && (
                            <p className="text-[11px] text-gray-500 truncate mt-1">{store.description}</p>
                          )}
                        </div>
                        <FiChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
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
