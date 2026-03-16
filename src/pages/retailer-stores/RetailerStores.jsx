import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  FiSearch, FiStar, FiUsers, FiPackage, FiMessageSquare,
  FiChevronLeft, FiChevronRight, FiHeart, FiX, FiShield,
  FiClock, FiTrendingUp,
} from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import { get, post } from "../../api/client"
import { FaStore } from "react-icons/fa6"

const avatarPalette = [
  "from-rose-500 to-rose-600",
  "from-rose-600 to-rose-700",
  "from-rose-400 to-rose-500",
  "from-rose-700 to-rose-800",
  "from-rose-500 to-pink-600",
  "from-rose-600 to-pink-700",
]

function getPalette(id) {
  const num = id?.charCodeAt?.(0) || 0
  return avatarPalette[num % avatarPalette.length]
}

function StoreCard({ store, isFollowing, onToggleFollow }) {
  const initial = store.storeName?.charAt(0)?.toUpperCase() || "S"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group"
    >
      {/* Top bar */}
      <div className={`h-2 bg-gradient-to-r ${getPalette(store._id)}`} />

      <div className="px-5 pt-4 pb-5">
        {/* Header row */}
        <div className="flex items-start gap-3.5">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPalette(store._id)} shadow-md flex items-center justify-center text-lg font-bold text-white flex-shrink-0`}
          >
            {initial}
          </motion.div>

          <div className="flex-1 min-w-0">
            <Link
              to={`/stores/${store.slug}`}
              className="font-bold text-gray-900 text-base hover:text-rose-600 transition-colors"
            >
              {store.storeName}
            </Link>
            {store.ownedBy?.fullName && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <FiUsers className="w-3 h-3 text-rose-400" />
                {store.ownedBy.fullName}
              </p>
            )}
          </div>

          {store.rating >= 4.5 && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex-shrink-0 mt-1">
              <FiTrendingUp className="w-3 h-3" /> Top Rated
            </div>
          )}
        </div>

        {/* Description */}
        {store.description && (
          <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-2">{store.description}</p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3.5 border-t border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-sm">
              <FiStar className="w-4 h-4 text-rose-500 fill-current" />
              <span className="font-bold text-gray-800">{(store.rating || 0).toFixed(1)}</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">Rating</span>
          </div>
          <div className="flex flex-col items-center text-center border-x border-gray-100">
            <div className="flex items-center gap-1 text-sm">
              <FiPackage className="w-4 h-4 text-rose-500" />
              <span className="font-bold text-gray-800">{store.productCount || 0}</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">Products</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-sm">
              <FiHeart className={`w-4 h-4 ${isFollowing ? "fill-current text-rose-500" : "text-rose-500"}`} />
              <span className="font-bold text-gray-800">{store.followerCount || 0}</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">Followers</span>
          </div>
        </div>

        {/* Follow button */}
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => { e.preventDefault(); onToggleFollow(store._id) }}
            className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              isFollowing
                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            }`}
          >
            <FiHeart className={`w-3.5 h-3.5 ${isFollowing ? "fill-current" : ""}`} />
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

  const { data, isLoading } = useApiQuery(
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-200 flex items-center justify-center">
              <FaStore className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">All Stores</h1>
              <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
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
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores by name..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {pagination.total > 0 && (
            <div className="flex items-center gap-3 text-sm text-gray-400 flex-shrink-0">
              <span className="flex items-center gap-1.5">
                <FaStore className="w-4 h-4 text-rose-500" />
                <span className="font-semibold text-gray-700">{pagination.total}</span>
              </span>
              <span className="text-gray-200">|</span>
              <span className="flex items-center gap-1.5">
                <FiUsers className="w-4 h-4 text-rose-500" />
                <span className="font-semibold text-gray-700">{stores.reduce((s, st) => s + (st.followerCount || 0), 0)}</span> followers
              </span>
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
                className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-2 bg-gray-100" />
                <div className="px-5 pt-4 pb-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-24" />
                      <div className="h-3 bg-gray-50 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-50 rounded w-full mt-3" />
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-3.5 border-t border-gray-100">
                    <div className="h-4 bg-gray-100 rounded w-10 mx-auto" />
                    <div className="h-4 bg-gray-100 rounded w-10 mx-auto" />
                    <div className="h-4 bg-gray-100 rounded w-10 mx-auto" />
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg mt-4" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 flex items-center justify-center">
              <FaStore className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-gray-800 font-semibold text-lg">No stores found</p>
            <p className="text-sm text-gray-400 mt-1">
              {debouncedSearch ? "Try a different search term" : "No stores available yet — check back later"}
            </p>
            {debouncedSearch && (
              <button
                onClick={() => setSearch("")}
                className="mt-5 px-5 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-colors flex items-center gap-2 mx-auto"
              >
                <FiX className="w-4 h-4" /> Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {stores.map((store) => (
                  <StoreCard
                    key={store._id}
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
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-rose-300 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </motion.button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-gray-300">...</span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 text-sm font-semibold rounded-lg transition-all ${
                          page === p
                            ? "bg-gray-900 text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-rose-300 hover:text-rose-600"
                        }`}
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
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-rose-300 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white"
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
