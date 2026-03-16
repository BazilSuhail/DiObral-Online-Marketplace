import { motion } from "motion/react"
import { Link } from "react-router-dom"
import { FiHeart, FiTrash2, FiShoppingBag, FiArrowRight } from "react-icons/fi"
import { FaStore, FaStar, FaStarHalfAlt } from "react-icons/fa"
import { useQueryClient } from "@tanstack/react-query"
import { useWishlistStore } from "../../store/wishlistStore"
import { useAuthStore } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import Button from "../../utilities/Button"

function StarRating({ rating }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} className="w-3 h-3 text-amber-400" />)
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="w-3 h-3 text-amber-400" />)
    else stars.push(<FaStar key={i} className="w-3 h-3 text-gray-200" />)
  }
  return <div className="flex gap-0.5">{stars}</div>
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

  const handleRemove = async (productId) => {
    await toggleWishlist(productId)
    queryClient.invalidateQueries({ queryKey: ["wishlist", "products"] })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to see your wishlist</h2>
          <p className="text-gray-500 mb-6">Save your favorite products and stores</p>
          <Link to="/signin">
            <Button variant="red">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiHeart className="text-red-500" /> My <span className="text-red-600">Wishlist</span>
          </h1>
          <p className="text-gray-500 mt-1">Products and stores you love</p>
        </motion.div>

        {/* Products */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiShoppingBag className="text-red-500" /> Products ({products.length})
          </h2>
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <FiHeart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No wishlisted products yet</p>
              <Link to="/productlist/All">
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
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <Link to={`/products/${product._id}`} className="block relative">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {product.sale && product.sale < product.price && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        -{Math.round((1 - product.sale / product.price) * 100)}%
                      </span>
                    )}
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-semibold text-gray-900 text-sm truncate hover:text-red-600 transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={product.rating} />
                      <span className="text-[10px] text-gray-400">({product.rating})</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {product.sale && product.sale < product.price ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">Rs. {Number(product.sale).toFixed(0)}</span>
                            <span className="text-[11px] text-gray-400 line-through">Rs. {product.price.toFixed(0)}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-900">Rs. {product.price.toFixed(0)}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); handleRemove(product._id) }}
                        className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Followed Stores */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaStore className="text-red-500" /> Followed Stores ({(Array.isArray(stores) ? stores : []).length})
          </h2>
          {loadingStores ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (Array.isArray(stores) ? stores : []).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <FaStore className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No stores followed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stores.map((store, i) => (
                <motion.div
                  key={store._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link to={`/stores/${store.slug}`} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                      <FaStore className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{store.storeName}</h3>
                      {store.rating && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <StarRating rating={store.rating} />
                          <span className="text-[10px] text-gray-400">({store.ratingCount})</span>
                        </div>
                      )}
                      {store.description && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{store.description}</p>
                      )}
                    </div>
                    <FiArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
