import { useState, useEffect, useCallback } from "react"
import { motion } from "motion/react"
import {
  FiStar, FiPackage, FiUsers, FiMessageSquare, FiHeart,
  FiChevronRight, FiTag, FiClock, FiPercent,
} from "react-icons/fi"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import { get, post } from "../../api/client"
import { API_BASE_URL } from "../../api/client"

function buildImageUrl(image) {
  if (!image) return "/placeholder.png"
  if (image.startsWith("http")) return image
  return `${API_BASE_URL}/uploads/${image}`
}

const gradientColors = [
  "from-red-600 to-red-700",
  "from-red-500 to-red-600",
  "from-rose-600 to-red-600",
  "from-red-700 to-rose-800",
  "from-rose-500 to-red-500",
  "from-red-600 to-pink-700",
]

function getGradient(id) {
  const num = id?.charCodeAt?.(0) || 0
  return gradientColors[num % gradientColors.length]
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })
}

function StoreReviewCard({ review }) {
  const name = review.customer?.fullName || "Anonymous"
  const initial = name.charAt(0).toUpperCase()
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm">{name}</span>
            <span className="text-xs text-gray-400 ml-auto">{formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={`w-3 h-3 ${i < review.rating ? "text-red-500 fill-current" : "text-gray-200 fill-current"}`} />
            ))}
          </div>
          {review.comment && <p className="text-gray-500 text-sm mt-1.5">{review.comment}</p>}
        </div>
      </div>
    </motion.div>
  )
}

function BundleCard({ bundle }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <FiPercent className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{bundle.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-red-600">${bundle.price?.toFixed(2)}</span>
            <span className="text-xs text-gray-400 line-through">${bundle.originalTotal?.toFixed(2)}</span>
            {bundle.youSavePercent > 0 && (
              <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                Save {bundle.youSavePercent}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{bundle.items?.length || 0} items</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function StoreDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [page, setPage] = useState(1)
  const [following, setFollowing] = useState(false)
  const [reviewPage, setReviewPage] = useState(1)

  const { data: storeData, isLoading } = useApiQuery(`/api/stores/${slug}`, null, {
    enabled: !!slug,
  })
  const store = storeData?.store || null
  const products = storeData?.products || []
  const categories = storeData?.categories || []
  const stats = storeData?.stats || {}

  const storeId = store?._id

  const { data: reviewsData } = useApiQuery(
    `/store-reviews/${storeId}`,
    { page: reviewPage, limit: 4 },
    { enabled: !!storeId },
  )
  const storeReviews = reviewsData?.reviews || []
  const reviewStats = reviewsData?.stats || {}
  const reviewPagination = reviewsData?.pagination || {}

  const { data: bundles } = useApiQuery(`/bundles/store/slug/${slug}`, null, {
    enabled: !!slug,
  })

  const fetchFollowingState = useCallback(async () => {
    if (!isAuthenticated || !storeId) return
    try {
      const res = await get("/wishlist/stores")
      setFollowing(res.some((s) => s._id === storeId))
    } catch {}
  }, [isAuthenticated, storeId])

  useEffect(() => { fetchFollowingState() }, [fetchFollowingState])

  const toggleFollow = async () => {
    if (!isAuthenticated) { navigate("/signin"); return }
    try {
      const res = await post(`/wishlist/stores/${storeId}`)
      setFollowing(res.following)
    } catch {}
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-100 rounded w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!store) return null

  const initial = store.storeName?.charAt(0)?.toUpperCase() || "S"

  return (
    <main className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-gray-400 mb-6"
        >
          <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link to="/stores" className="hover:text-red-600 transition-colors">Stores</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-red-700 font-semibold truncate">{store.storeName}</span>
        </motion.nav>

        {/* Store Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-red-100/50 to-red-200/30" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-gradient-to-br from-red-50/50 to-red-100/30" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getGradient(store._id)} shadow-xl shadow-red-600/20 flex items-center justify-center text-3xl font-bold text-white border-2 border-white flex-shrink-0`}
              >
                {initial}
              </motion.div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{store.storeName}</h1>
                {store.ownedBy?.fullName && (
                  <p className="text-sm text-gray-500 mt-0.5">Owned by {store.ownedBy.fullName}</p>
                )}
                {store.description && (
                  <p className="text-gray-500 text-sm mt-2 max-w-2xl leading-relaxed">{store.description}</p>
                )}

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
                  <div className="flex items-center gap-1.5">
                    <FiStar className="w-4 h-4 text-red-500 fill-current" />
                    <span className="font-bold text-gray-900">{stats.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-xs text-gray-400">({stats.ratingCount || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiPackage className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-gray-700">{stats.productCount || 0}</span>
                    <span className="text-xs text-gray-400">products</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiUsers className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-gray-700">{stats.followerCount || 0}</span>
                    <span className="text-xs text-gray-400">followers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiMessageSquare className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-gray-700">{stats.ratingCount || 0}</span>
                    <span className="text-xs text-gray-400">reviews</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={toggleFollow}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex-shrink-0 ${
                  following
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/20"
                }`}
              >
                <FiHeart className={`w-4 h-4 ${following ? "fill-current" : ""}`} />
                {following ? "Following" : "Follow Store"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main content */}
          <div className="lg:col-span-8 space-y-8">

            {/* Products */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-red-500" />
                  Products ({products.length})
                </h2>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                  <FiPackage className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No products yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p, i) => {
                    const pPrice = p.price ?? 0
                    const pSalePercentage = p.sale ?? 0
                    const pHasSale = pSalePercentage > 0 && pSalePercentage < 100
                    const pSale = pHasSale ? pPrice * (1 - pSalePercentage / 100) : pPrice
                    return (
                      <Link key={p._id} to={`/products/${p._id}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          whileHover={{ y: -4 }}
                          className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                        >
                          <div className="relative overflow-hidden bg-gray-50 h-36 sm:h-40">
                            <img src={buildImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {pHasSale && (
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                Sale
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {pHasSale ? (
                                <>
                                  <span className="text-sm font-bold text-red-600">${pSale.toFixed(2)}</span>
                                  <span className="text-xs text-gray-300 line-through">${pPrice.toFixed(2)}</span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-gray-900">${pPrice.toFixed(2)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1.5">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, si) => (
                                  <FiStar key={si} className={`w-2.5 h-2.5 ${si < Math.floor(p.rating || 0) ? "text-red-500 fill-current" : "text-gray-200 fill-current"}`} />
                                ))}
                              </div>
                              <span className="text-[10px] text-gray-400">({p.totalReviews || 0})</span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </motion.section>

            {/* Bundles */}
            {bundles?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiPercent className="w-5 h-5 text-red-500" />
                  Bundles & Deals
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bundles.map((b) => (
                    <BundleCard key={b._id} bundle={b} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Store Reviews */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiMessageSquare className="w-5 h-5 text-red-500" />
                Store Reviews
                {reviewStats.totalReviews > 0 && (
                  <span className="text-sm font-normal text-gray-400">({reviewStats.totalReviews})</span>
                )}
              </h2>

              {reviewStats.averageRating > 0 && (
                <div className="flex items-center gap-3 mb-4 bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <span className="text-2xl font-bold text-red-700">{reviewStats.averageRating?.toFixed(1)}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`w-4 h-4 ${i < Math.round(reviewStats.averageRating) ? "text-red-500 fill-current" : "text-gray-200 fill-current"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">{reviewStats.totalReviews} reviews</span>
                </div>
              )}

              {storeReviews.length === 0 ? (
                <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
                  <FiMessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storeReviews.map((r) => (
                    <StoreReviewCard key={r._id} review={r} />
                  ))}
                  {reviewPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      {Array.from({ length: reviewPagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <motion.button
                          key={p}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setReviewPage(p)}
                          className={`w-8 h-8 text-xs font-medium rounded-lg transition-all ${
                            reviewPage === p
                              ? "bg-red-600 text-white shadow-sm"
                              : "bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600"
                          }`}
                        >
                          {p}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* Categories */}
            {categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiTag className="w-4 h-4 text-red-500" />
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id || cat.name}
                      to={`/productlist/${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-")}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FiTag className="w-3 h-3" />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-red-500" />
                Store Info
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Products</span>
                  <span className="font-semibold text-gray-800">{stats.productCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Followers</span>
                  <span className="font-semibold text-gray-800">{stats.followerCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Rating</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1">
                    <FiStar className="w-3.5 h-3.5 text-red-500 fill-current" />
                    {stats.rating?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Reviews</span>
                  <span className="font-semibold text-gray-800">{stats.ratingCount || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
