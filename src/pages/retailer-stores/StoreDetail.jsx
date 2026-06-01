import { useState, useEffect, useCallback } from "react"
import { motion, useReducedMotion, AnimatePresence } from "motion/react"
import {
  FiStar, FiPackage, FiUsers, FiMessageSquare, FiHeart,
  FiChevronRight, FiTag, FiClock, FiPercent, FiCheckCircle, FiUser,
  FiUserPlus, FiUserCheck, FiLayers, FiGrid, FiArrowLeft, FiCalendar,
  FiShoppingBag, FiGift, FiInfo,
} from "react-icons/fi"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import { get, post } from "../../api/client"
import { API_BASE_URL } from "../../api/client"
import { NotFound, NoProducts, NoReviews } from "../../components/illustrations"

function buildImageUrl(image) {
  if (!image) return "/placeholder.png"
  if (image.startsWith("http")) return image
  return `${API_BASE_URL}/uploads/${image}`
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
      className="soft-card rounded-3xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-red-50 ring-1 ring-red-100 flex items-center justify-center text-sm font-semibold text-red-600 flex-shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
              <FiUser className="w-3 h-3 text-gray-400" />
              {name}
            </span>
            <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {formatDate(review.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-red-500 fill-current" : "text-gray-200 fill-current"}`} />
            ))}
          </div>
          {review.comment && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.comment}</p>}
        </div>
      </div>
    </motion.div>
  )
}

function BundleCard({ bundle }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="soft-card soft-card-hover rounded-3xl p-5"
    >
      <div className="flex items-start gap-3">
        <span className="soft-icon-tile flex-shrink-0">
          <FiGift className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{bundle.name}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-base font-semibold text-red-600">${bundle.price?.toFixed(2)}</span>
            <span className="text-xs text-gray-400 line-through">${bundle.originalTotal?.toFixed(2)}</span>
            {bundle.youSavePercent > 0 && (
              <span className="soft-badge soft-badge-success">
                <FiPercent className="h-3 w-3" />
                Save {bundle.youSavePercent}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
            <FiLayers className="w-3.5 h-3.5 text-gray-400" />
            {bundle.items?.length || 0} items
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h2 className="soft-section-title text-lg font-semibold text-gray-900">
      <span className="soft-icon-tile soft-icon-tile-sm"><Icon className="w-4 h-4" /></span>
      {children}
    </h2>
  )
}

export default function StoreDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const reduce = useReducedMotion()

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
      <main className="soft-page">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="space-y-6">
            <div className="soft-skeleton h-48 rounded-3xl" />
            <div className="flex gap-4">
              <div className="soft-skeleton w-20 h-20 rounded-3xl" />
              <div className="flex-1 space-y-2">
                <div className="soft-skeleton h-6 w-48" />
                <div className="soft-skeleton h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="soft-skeleton h-40 rounded-3xl" />)}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!store) {
    return (
      <main className="soft-page">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="soft-card rounded-3xl mx-auto max-w-lg px-6 py-12 flex flex-col items-center text-center">
            <NotFound size={200} className="mb-6" />
            <h1 className="text-xl font-semibold text-gray-900">Store not found</h1>
            <p className="mt-2 text-sm text-gray-500">This store may have moved or no longer exists.</p>
            <Link to="/stores" className="soft-btn soft-btn-primary mt-6">
              <FiArrowLeft className="h-4 w-4" />
              Back to stores
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const initial = store.storeName?.charAt(0)?.toUpperCase() || "S"

  const statTiles = [
    { icon: FiStar, label: "Rating", value: stats.rating?.toFixed(1) || "0.0", sub: `${stats.ratingCount || 0} ratings` },
    { icon: FiPackage, label: "Products", value: stats.productCount || 0 },
    { icon: FiUsers, label: "Followers", value: stats.followerCount || 0 },
    { icon: FiMessageSquare, label: "Reviews", value: stats.ratingCount || 0 },
  ]

  return (
    <main className="soft-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* Breadcrumb */}
        <motion.nav
          initial={reduce ? false : { opacity: 0, x: -10 }}
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
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card relative rounded-3xl overflow-hidden mb-8"
        >
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gray-100" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gray-100/70" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <motion.div
                whileHover={reduce ? undefined : { scale: 1.05, rotate: -2 }}
                className="w-24 h-24 rounded-3xl bg-red-50 text-red-600 ring-1 ring-red-100 shadow-soft-red flex items-center justify-center text-4xl font-semibold flex-shrink-0"
              >
                {initial}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">{store.storeName}</h1>
                  <span className="soft-badge soft-badge-success">
                    <FiCheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                </div>
                {store.ownedBy?.fullName && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                    <FiUser className="w-3.5 h-3.5 text-gray-400" />
                    Owned by {store.ownedBy.fullName}
                  </p>
                )}
                {store.description && (
                  <p className="text-gray-600 text-sm mt-2 max-w-2xl leading-relaxed">{store.description}</p>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  {statTiles.map((t, i) => (
                    <motion.div
                      key={t.label}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      whileHover={reduce ? undefined : { y: -2 }}
                      className="soft-card-inset rounded-2xl px-3 py-2.5 flex items-center gap-2.5"
                    >
                      <span className="soft-icon-tile soft-icon-tile-sm flex-shrink-0">
                        <t.icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900 leading-snug">{t.value}</p>
                        <p className="text-[11px] font-medium text-gray-500 truncate">{t.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={reduce ? undefined : { scale: 1.03 }}
                whileTap={reduce ? undefined : { scale: 0.96 }}
                onClick={toggleFollow}
                className={`soft-btn flex-shrink-0 ${following ? "soft-btn-secondary" : "soft-btn-primary"}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={following ? "following" : "follow"}
                    initial={reduce ? false : { opacity: 0, scale: 0.7, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex items-center gap-2"
                  >
                    {following ? <FiUserCheck className="w-4 h-4" /> : <FiUserPlus className="w-4 h-4" />}
                    {following ? "Following" : "Follow Store"}
                    <FiHeart className={`w-4 h-4 ${following ? "fill-current" : ""}`} />
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main content */}
          <div className="lg:col-span-8 space-y-8">

            {/* Products */}
            <motion.section
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <SectionTitle icon={FiGrid}>Products ({products.length})</SectionTitle>
              </div>

              {products.length === 0 ? (
                <div className="soft-card rounded-3xl mx-auto px-6 py-10 flex flex-col items-center text-center">
                  <NoProducts size={160} className="mb-4" />
                  <p className="text-base font-semibold text-gray-900">No products yet</p>
                  <p className="mt-1 text-sm text-gray-500">This store hasn't listed anything. Check back soon.</p>
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
                          initial={reduce ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          whileHover={reduce ? undefined : { y: -4 }}
                          className="group soft-card soft-card-hover rounded-3xl overflow-hidden"
                        >
                          <div className="relative overflow-hidden bg-gray-100 h-36 sm:h-40">
                            <img src={buildImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {pHasSale && (
                              <span className="soft-badge soft-badge-sale absolute top-2.5 left-2.5">
                                <FiPercent className="h-3 w-3" />
                                Sale
                              </span>
                            )}
                          </div>
                          <div className="p-3.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {pHasSale ? (
                                <>
                                  <span className="text-sm font-semibold text-red-600">${pSale.toFixed(2)}</span>
                                  <span className="text-xs text-gray-400 line-through">${pPrice.toFixed(2)}</span>
                                </>
                              ) : (
                                <span className="text-sm font-semibold text-gray-900">${pPrice.toFixed(2)}</span>
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
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-4">
                  <SectionTitle icon={FiLayers}>Bundles & Deals</SectionTitle>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bundles.map((b) => (
                    <BundleCard key={b._id} bundle={b} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Store Reviews */}
            <motion.section
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-4">
                <SectionTitle icon={FiMessageSquare}>
                  Store Reviews
                  {reviewStats.totalReviews > 0 && (
                    <span className="text-sm font-normal text-gray-400">({reviewStats.totalReviews})</span>
                  )}
                </SectionTitle>
              </div>

              {reviewStats.averageRating > 0 && (
                <div className="soft-card rounded-3xl flex items-center gap-4 mb-4 px-5 py-4">
                  <span className="soft-icon-tile soft-icon-tile-lg flex-shrink-0 text-2xl font-semibold text-red-700">
                    {reviewStats.averageRating?.toFixed(1)}
                  </span>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`w-4 h-4 ${i < Math.round(reviewStats.averageRating) ? "text-red-500 fill-current" : "text-gray-200 fill-current"}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                      <FiMessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      {reviewStats.totalReviews} reviews
                    </span>
                  </div>
                </div>
              )}

              {storeReviews.length === 0 ? (
                <div className="soft-card rounded-3xl mx-auto px-6 py-10 flex flex-col items-center text-center">
                  <NoReviews size={160} className="mb-4" />
                  <p className="text-base font-semibold text-gray-900">No reviews yet</p>
                  <p className="mt-1 text-sm text-gray-500">Be the first to share your experience with this store.</p>
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
                          whileHover={reduce ? undefined : { scale: 1.05 }}
                          whileTap={reduce ? undefined : { scale: 0.95 }}
                          onClick={() => setReviewPage(p)}
                          className={`soft-chip ${reviewPage === p ? "soft-chip-active" : ""}`}
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
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="soft-card rounded-3xl p-5"
              >
                <h3 className="soft-section-title text-sm font-semibold text-gray-900 mb-4">
                  <span className="soft-icon-tile soft-icon-tile-sm"><FiTag className="w-4 h-4" /></span>
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id || cat.name}
                      to={`/productlist/${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-")}`}
                      className="soft-chip"
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
              initial={reduce ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="soft-card rounded-3xl p-5"
            >
              <h3 className="soft-section-title text-sm font-semibold text-gray-900 mb-4">
                <span className="soft-icon-tile soft-icon-tile-sm"><FiInfo className="w-4 h-4" /></span>
                Store Info
              </h3>
              <div className="space-y-2">
                {[
                  { icon: FiShoppingBag, label: "Products", value: stats.productCount || 0 },
                  { icon: FiUsers, label: "Followers", value: stats.followerCount || 0 },
                  { icon: FiStar, label: "Rating", value: stats.rating?.toFixed(1) || "0.0", star: true },
                  { icon: FiClock, label: "Reviews", value: stats.ratingCount || 0 },
                ].map((row) => (
                  <div key={row.label} className="soft-card-inset rounded-2xl flex items-center justify-between text-sm px-3 py-2.5">
                    <span className="text-gray-500 flex items-center gap-2">
                      <row.icon className="w-4 h-4 text-red-500" />
                      {row.label}
                    </span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      {row.star && <FiStar className="w-3.5 h-3.5 text-red-500 fill-current" />}
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
