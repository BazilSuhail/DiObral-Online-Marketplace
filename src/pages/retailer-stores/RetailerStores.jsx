import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  FiSearch, FiStar, FiUsers, FiPackage,
  FiChevronLeft, FiChevronRight, FiX, FiShield,
  FiAward, FiUserPlus, FiUserCheck, FiUser, FiRefreshCw, FiGrid,
} from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import { get, post } from "../../api/client"
import { FaStore } from "react-icons/fa6"
import { NoStores, ErrorState } from "../../components/illustrations"

function StoreCard({ store, isFollowing, onToggleFollow, index = 0 }) {
  const reduce = useReducedMotion()
  const initial = store.storeName?.charAt(0)?.toUpperCase() || "S"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: reduce ? 0 : Math.min(index, 8) * 0.05, duration: reduce ? 0 : 0.35 }}
      whileHover={reduce ? undefined : { y: -6, rotate: -0.4 }}
      className="soft-card soft-card-hover rounded-3xl overflow-hidden group"
    >
      <div className="p-5">
        <div className="flex items-start gap-3.5">
          <motion.div
            whileHover={reduce ? undefined : { scale: 1.08 }}
            className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 shadow-soft-xs flex items-center justify-center text-xl font-semibold flex-shrink-0"
          >
            {initial}
          </motion.div>

          <div className="flex-1 min-w-0">
            <Link
              to={`/stores/${store.slug}`}
              className="font-semibold text-gray-900 text-base hover:text-red-600 transition-colors block truncate"
            >
              {store.storeName}
            </Link>
            {store.ownedBy?.fullName && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <FiUser className="w-3 h-3 text-red-400" />
                <span className="truncate">{store.ownedBy.fullName}</span>
              </p>
            )}
            <span className="soft-badge soft-badge-neutral mt-2 inline-flex items-center gap-1">
              <FiStar className="w-3 h-3 text-red-500 fill-current" />
              {(store.rating || 0).toFixed(1)}
            </span>
          </div>

          {store.rating >= 4.5 && (
            <span className="soft-badge soft-badge-sale flex-shrink-0 inline-flex items-center gap-1">
              <FiAward className="w-3 h-3" /> Top Rated
            </span>
          )}
        </div>

        {store.description && (
          <p className="text-xs text-gray-600 mt-3 leading-relaxed line-clamp-2">{store.description}</p>
        )}

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="soft-card-inset rounded-2xl py-2.5 flex flex-col items-center text-center">
            <FiStar className="w-4 h-4 text-red-500 fill-current" />
            <span className="font-semibold text-gray-900 text-sm mt-1">{(store.rating || 0).toFixed(1)}</span>
            <span className="text-[10px] text-gray-500">Rating</span>
          </div>
          <div className="soft-card-inset rounded-2xl py-2.5 flex flex-col items-center text-center">
            <FiPackage className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-gray-900 text-sm mt-1">{store.productCount || 0}</span>
            <span className="text-[10px] text-gray-500">Products</span>
          </div>
          <div className="soft-card-inset rounded-2xl py-2.5 flex flex-col items-center text-center">
            <FiUsers className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-gray-900 text-sm mt-1">{store.followerCount || 0}</span>
            <span className="text-[10px] text-gray-500">Followers</span>
          </div>
        </div>

        <div className="mt-4">
          <motion.button
            whileHover={reduce ? undefined : { scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            onClick={(e) => { e.preventDefault(); onToggleFollow(store._id) }}
            className={`soft-btn w-full ${isFollowing ? "soft-btn-secondary" : "soft-btn-ghost"}`}
          >
            {isFollowing ? <FiUserCheck className="w-4 h-4" /> : <FiUserPlus className="w-4 h-4" />}
            {isFollowing ? "Following" : "Follow Store"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function RetailerStores() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [followingIds, setFollowingIds] = useState({})

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const { data, isLoading, isError, refetch } = useApiQuery(
    "/api/stores",
    { page, limit: 12, search: debouncedSearch || undefined },
  )
  const stores = data?.stores || []
  const pagination = data?.pagination || {}

  const fetchFollowing = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await get("/wishlist/stores")
      const map = {}
      res.forEach((s) => { map[s._id] = true })
      setFollowingIds(map)
    } catch {}
  }, [isAuthenticated])

  useEffect(() => { fetchFollowing() }, [fetchFollowing])

  const toggleFollow = async (storeId) => {
    if (!isAuthenticated) { navigate("/signin"); return }
    try {
      const res = await post(`/wishlist/stores/${storeId}`)
      setFollowingIds((prev) => ({ ...prev, [storeId]: res.following }))
    } catch {}
  }

  return (
    <main className="soft-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-1">
            <span className="soft-icon-tile soft-icon-tile-lg">
              <FaStore className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">All Stores</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <FiShield className="w-3.5 h-3.5" /> Discover unique shops and retailers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="soft-card rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores by name..."
              className="soft-input w-full pl-10 pr-9"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors" aria-label="Clear search">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {pagination.total > 0 && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="soft-card-inset rounded-2xl px-3 py-2 flex items-center gap-2.5">
                <span className="soft-icon-tile soft-icon-tile-sm"><FaStore className="w-4 h-4" /></span>
                <div>
                  <p className="text-[10px] text-gray-500 leading-tight mb-0.5">Stores</p>
                  <p className="font-semibold text-gray-900 text-sm">{pagination.total}</p>
                </div>
              </div>
              <div className="soft-card-inset rounded-2xl px-3 py-2 flex items-center gap-2.5">
                <span className="soft-icon-tile soft-icon-tile-sm"><FiUsers className="w-4 h-4" /></span>
                <div>
                  <p className="text-[10px] text-gray-500 leading-tight mb-0.5">Followers</p>
                  <p className="font-semibold text-gray-900 text-sm">{stores.reduce((s, st) => s + (st.followerCount || 0), 0)}</p>
                </div>
              </div>
              <div className="soft-card-inset rounded-2xl px-3 py-2 hidden md:flex items-center gap-2.5">
                <span className="soft-icon-tile soft-icon-tile-sm"><FiGrid className="w-4 h-4" /></span>
                <div>
                  <p className="text-[10px] text-gray-500 leading-tight mb-0.5">Page</p>
                  <p className="font-semibold text-gray-900 text-sm">{page}{pagination.totalPages ? `/${pagination.totalPages}` : ""}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="soft-card rounded-3xl overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3.5">
                    <div className="soft-skeleton w-14 h-14 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <div className="soft-skeleton h-4 w-24" />
                      <div className="soft-skeleton h-3 w-16" />
                    </div>
                  </div>
                  <div className="soft-skeleton h-3 w-full mt-3" />
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="soft-skeleton h-14 rounded-2xl" />
                    <div className="soft-skeleton h-14 rounded-2xl" />
                    <div className="soft-skeleton h-14 rounded-2xl" />
                  </div>
                  <div className="soft-skeleton h-10 rounded-full mt-4" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="soft-card mx-auto max-w-lg rounded-3xl px-6 py-12 flex flex-col items-center text-center"
          >
            <ErrorState size={200} className="mb-6" />
            <h3 className="text-xl font-semibold text-gray-900">Could not load stores</h3>
            <p className="mt-2 text-sm text-gray-500">Something went wrong. Please try again.</p>
            <button onClick={() => refetch()} className="soft-btn soft-btn-ghost mt-6">
              <FiRefreshCw className="h-4 w-4" /> Try again
            </button>
          </motion.div>
        ) : stores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="soft-card mx-auto max-w-lg rounded-3xl px-6 py-12 flex flex-col items-center text-center"
          >
            <NoStores size={200} className="mb-6" />
            <h3 className="text-xl font-semibold text-gray-900">No stores found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {debouncedSearch ? "Try a different search term" : "No stores available yet — check back later"}
            </p>
            {debouncedSearch && (
              <button onClick={() => setSearch("")} className="soft-btn soft-btn-secondary mt-6">
                <FiX className="w-4 h-4" /> Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {stores.map((store, i) => (
                  <StoreCard
                    key={store._id}
                    index={i}
                    store={store}
                    isFollowing={!!followingIds[store._id]}
                    onToggleFollow={toggleFollow}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 mt-10"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="soft-icon-btn w-10 h-10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </motion.button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(p)}
                        className={`soft-chip w-10 h-10 !p-0 justify-center ${page === p ? "soft-chip-active" : ""}`}
                      >
                        {p}
                      </motion.button>
                    </span>
                  ))}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="soft-icon-btn w-10 h-10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
