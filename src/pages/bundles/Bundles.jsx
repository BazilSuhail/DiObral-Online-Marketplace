import { useCallback, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Link, useSearchParams } from "react-router-dom"
import { FiSearch, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiLoader, FiPercent, FiPackage } from "react-icons/fi"
import { useApiQuery } from "../../api/adapter"
import { API_BASE_URL } from "../../api/client"
import Button from "../../components/ui/Button.jsx"
import { limitText, normalizeTags } from "../../lib/utils"

const Input = ({ className = "", ...props }) => (
  <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
)

const Select = ({ children, value, onValueChange, className = "" }) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)} className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent ${className}`}>
    {children}
  </select>
)

const SORT_MAP = { "price-low": "price_asc", "price-high": "price_desc", newest: "newest" }

function buildImageUrl(image) {
  if (!image) return "/placeholder.png"
  if (image.startsWith("http")) return image
  return `${API_BASE_URL}/uploads/${image}`
}

export default function Bundles() {
  const [searchParams, setSearchParams] = useSearchParams()

  const searchTerm = searchParams.get("search") || ""
  const sortBy = searchParams.get("sort") || "newest"
  const page = parseInt(searchParams.get("page")) || 1
  const viewMode = searchParams.get("view") || "grid"

  const [searchInput, setSearchInput] = useState(searchTerm)
  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm)
  const debounceRef = useRef(null)

  if (searchTerm !== prevSearchTerm) {
    setPrevSearchTerm(searchTerm)
    setSearchInput(searchTerm)
  }

  const setFilter = useCallback((key, value) => {
    if (key === "search" && !value) clearTimeout(debounceRef.current)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      const isFilterChange = !["page", "view"].includes(key)
      if (value === null || value === "" || value === undefined) {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
      if (isFilterChange) next.delete("page")
      return next
    }, { replace: true })
  }, [setSearchParams])

  const handleSearchInput = useCallback((e) => {
    const value = e.target.value
    setSearchInput(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setFilter("search", value), 350)
  }, [setFilter])

  const queryParams = useMemo(() => {
    const qp = { page, limit: 20 }
    if (searchTerm) qp.search = searchTerm
    if (sortBy !== "newest") qp.sort = SORT_MAP[sortBy] || sortBy
    return qp
  }, [page, searchTerm, sortBy])

  const { data: bundlesRes, isLoading, isFetching } = useApiQuery("/api/bundles", queryParams, { placeholderData: (prev) => prev })

  const bundles = bundlesRes?.bundles || []
  const pagination = bundlesRes?.pagination || {}

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12">
        <div className="mb-8">
          <h1 className="text-[22px] lg:text-[30px] font-bold text-gray-900">Bundle <span className="text-red-700">Deals</span></h1>
          <p className="text-gray-600">Save more with curated bundles from our stores.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input placeholder="Search bundles..." value={searchInput} onChange={handleSearchInput} className="pl-10" />
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={(v) => setFilter("sort", v)} className="w-48">
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === "grid" ? "red" : "outline"} size="sm" onClick={() => setFilter("view", "grid")}><FiGrid className="w-4 h-4" /></Button>
              <Button variant={viewMode === "list" ? "red" : "outline"} size="sm" onClick={() => setFilter("view", "list")}><FiList className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {(isLoading || (isFetching && !bundles.length)) ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="mb-4 h-5 bg-gray-200 rounded w-64 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="w-full aspect-[4/5] bg-gray-200 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded w-full animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">Showing {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total || bundles.length)} of {pagination.total || bundles.length} bundles</p>
                {isFetching && (
                  <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Updating...
                  </div>
                )}
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {bundles.map((bundle, index) => (
                    <motion.div
                      key={bundle._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -3 }}
                      className="group cursor-pointer"
                    >
                      <Link to={`/bundles/${bundle._id}`}>
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
                          <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                            <img src={buildImageUrl(bundle.image)} alt={bundle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {bundle.youSavePercent > 0 && (
                              <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                                <FiPercent className="w-3 h-3" /> {bundle.youSavePercent}%
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-gray-900/70 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <FiPackage className="w-3 h-3" /> {bundle.items?.length || 0} items
                            </div>
                          </div>
                          <div className="p-3 space-y-1">
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2" title={bundle.name}>{limitText(bundle.name, 40)}</h3>
                            <p className="text-[11px] text-gray-400 truncate">{bundle.store?.storeName || ""}</p>
                            {(() => {
                              const tags = normalizeTags(bundle.tags)
                              if (!tags.length) return null
                              const shown = tags.slice(0, 3)
                              const extra = tags.length - shown.length
                              return (
                                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                  {shown.map((tag) => (
                                    <span key={tag} className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[90px]">{tag}</span>
                                  ))}
                                  {extra > 0 && <span className="text-[9px] font-bold text-red-600">+{extra}</span>}
                                </div>
                              )
                            })()}
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-bold text-gray-900">${bundle.price?.toFixed(2)}</span>
                              {bundle.originalTotal > bundle.price && (
                                <span className="text-xs text-gray-400 line-through">${bundle.originalTotal.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {bundles.map((bundle, index) => (
                    <motion.div
                      key={bundle._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                    >
                      <Link to={`/bundles/${bundle._id}`}>
                        <div className="flex items-center gap-4 p-3">
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                            <img src={buildImageUrl(bundle.image)} alt={bundle.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate" title={bundle.name}>{limitText(bundle.name, 40)}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{bundle.store?.storeName || ""} · {bundle.items?.length || 0} items</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="font-bold text-gray-900">${bundle.price?.toFixed(2)}</span>
                              {bundle.originalTotal > bundle.price && (
                                <span className="text-xs text-gray-400 line-through">${bundle.originalTotal.toFixed(2)}</span>
                              )}
                              {bundle.youSavePercent > 0 && (
                                <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                                  Save {bundle.youSavePercent}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {bundles.length === 0 && !isFetching && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No bundles found</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    Try adjusting your search to find what you&apos;re looking for.
                  </p>
                  <Button variant="outline" onClick={() => { clearTimeout(debounceRef.current); setSearchParams({}, { replace: true }) }}>
                    Clear Filters
                  </Button>
                </div>
              )}

              {pagination.totalPages > 1 && (() => {
                const totalPages = pagination.totalPages
                const windowSize = 5
                let start = Math.max(1, page - Math.floor(windowSize / 2))
                const end = Math.min(totalPages, start + windowSize - 1)
                start = Math.max(1, end - windowSize + 1)
                const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)
                return (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button disabled={page <= 1} onClick={() => setFilter("page", page - 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    {start > 1 && (
                      <>
                        <button onClick={() => setFilter("page", 1)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${1 === page ? "bg-red-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>1</button>
                        {start > 2 && <span className="px-1 text-gray-400">…</span>}
                      </>
                    )}
                    {pages.map(p => (
                      <button key={p} onClick={() => setFilter("page", p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-red-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>
                        {p}
                      </button>
                    ))}
                    {end < totalPages && (
                      <>
                        {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
                        <button onClick={() => setFilter("page", totalPages)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${totalPages === page ? "bg-red-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>{totalPages}</button>
                      </>
                    )}
                    <button disabled={page >= totalPages} onClick={() => setFilter("page", page + 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
