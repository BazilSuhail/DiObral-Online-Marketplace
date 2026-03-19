import { useMemo, useEffect, useCallback, useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { FiSearch, FiFilter, FiGrid, FiList, FiStar, FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi"
import { useApiQuery } from "../../api/adapter"
import { API_BASE_URL } from "../../api/client"
import Button from "../../components/ui/Button.jsx"
import Badge from "../../components/ui/Badge.jsx"

const Input = ({ className = "", ...props }) => (
  <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
)

const Select = ({ children, value, onValueChange, className = "" }) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)} className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent ${className}`}>
    {children}
  </select>
)

const Checkbox = ({ id, checked, onCheckedChange, className = "", label, labelClassName = "" }) => (
  <div className={`flex items-center ${className}`}>
    <div className="relative">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} className="absolute opacity-0 h-0 w-0" />
      <div className={`flex items-center justify-center w-4 h-4 border-2 rounded ${checked ? 'border-red-400 bg-red-400' : 'border-gray-300'} transition-all duration-200`}>
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
    {label && <label htmlFor={id} className={`ml-2 text-sm font-medium text-gray-700 cursor-pointer ${labelClassName}`}>{label}</label>}
  </div>
)

const Slider = ({ value, onValueChange, min, max, step, className = "" }) => (
  <input
    type="range" min={min} max={max} step={step}
    value={value[0]}
    onChange={(e) => onValueChange([Number.parseInt(e.target.value), value[1]])}
    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5
      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-700 [&::-webkit-slider-thumb]:border-0
      [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150
      hover:[&::-webkit-slider-thumb]:scale-115 focus:[&::-webkit-slider-thumb]:scale-115
      focus:[&::-webkit-slider-thumb]:ring-2 focus:[&::-webkit-slider-thumb]:ring-red-300 ${className}`}
  />
)

function buildImageUrl(image) {
  if (!image) return "/placeholder.png"
  if (image.startsWith("http")) return image
  return `${API_BASE_URL}/uploads/${image}`
}

const DEFAULT_PRICE_MIN = 1000
const DEFAULT_PRICE_MAX = 8000
const SORT_MAP = { "price-low": "price_asc", "price-high": "price_desc", rating: "rating", newest: "newest", popular: "popular" }

export default function Products() {
  const { urlCategory } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const searchTerm = searchParams.get("search") || ""
  const selectedCategoryId = searchParams.get("category") || null
  const priceMin = parseInt(searchParams.get("minPrice")) || DEFAULT_PRICE_MIN
  const priceMax = parseInt(searchParams.get("maxPrice")) || DEFAULT_PRICE_MAX
  const sortBy = searchParams.get("sort") || "featured"
  const page = parseInt(searchParams.get("page")) || 1
  const viewMode = searchParams.get("view") || "grid"
  const priceRange = useMemo(() => [priceMin, priceMax], [priceMin, priceMax])

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
      const defaults = { sort: "featured", view: "grid", minPrice: DEFAULT_PRICE_MIN, maxPrice: DEFAULT_PRICE_MAX, page: 1 }

      if (value === defaults[key] || value === null || value === "" || value === undefined) {
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

  const setPriceRange = useCallback(([min, max]) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (min > DEFAULT_PRICE_MIN) next.set("minPrice", String(min)); else next.delete("minPrice")
      if (max < DEFAULT_PRICE_MAX) next.set("maxPrice", String(max)); else next.delete("maxPrice")
      next.delete("page")
      return next
    }, { replace: true })
  }, [setSearchParams])

  const queryParams = useMemo(() => {
    const qp = { page, limit: 20 }
    if (searchTerm) qp.search = searchTerm
    if (selectedCategoryId) qp.category = selectedCategoryId
    if (priceMin > DEFAULT_PRICE_MIN) qp.minPrice = priceMin
    if (priceMax < DEFAULT_PRICE_MAX) qp.maxPrice = priceMax
    if (sortBy !== "featured") qp.sort = SORT_MAP[sortBy] || sortBy
    return qp
  }, [page, searchTerm, selectedCategoryId, priceMin, priceMax, sortBy])

  const { data: productsRes, isLoading, isFetching } = useApiQuery("/api/products", queryParams, { placeholderData: (prev) => prev })
  const { data: categoriesRaw, isLoading: categoriesLoading } = useApiQuery("/categories")

  const products = productsRes?.products || []
  const pagination = productsRes?.pagination || {}

  const categories = useMemo(() => {
    if (!categoriesRaw) return []
    const buildTree = (items, parentId = null) =>
      items.filter(c => c.parent === parentId || (!c.parent && !parentId)).map(c => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        children: c.children || buildTree(items, c._id),
      }))
    return buildTree(categoriesRaw)
  }, [categoriesRaw])

  useEffect(() => {
    if (urlCategory && categories.length) {
      const decoded = decodeURIComponent(urlCategory).toLowerCase()
      if (decoded === "all") {
        if (selectedCategoryId) setFilter("category", null)
        return
      }
      const toSlug = (str) => str.toLowerCase().replace(/\s+/g, "-")
      const found = categories.find(c =>
        c.name.toLowerCase() === decoded ||
        (c.slug && c.slug.toLowerCase() === decoded) ||
        toSlug(c.name) === decoded
      )
      if (found && found._id !== selectedCategoryId) {
        setFilter("category", found._id)
      }
    }
  }, [urlCategory, categories])

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12">
        <div className="mb-8">
          <h1 className="text-[22px] lg:text-[30px] font-bold text-gray-900">All <span className="text-red-700">Products</span></h1>
          <p className="text-gray-600">Discover our complete collection of premium products.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input placeholder="Search products..." value={searchInput} onChange={handleSearchInput} className="pl-10" />
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={(v) => setFilter("sort", v)} className="w-48">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === "grid" ? "red" : "outline"} size="sm" onClick={() => setFilter("view", "grid")}><FiGrid className="w-4 h-4" /></Button>
              <Button variant={viewMode === "list" ? "red" : "outline"} size="sm" onClick={() => setFilter("view", "list")}><FiList className="w-4 h-4" /></Button>
            </div>
            <Button variant="outline" onClick={() => setFilter("filterOpen", prev => !prev)} className="lg:hidden"><FiFilter className="w-4 h-4 mr-2" />Filters</Button>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          <div className="hidden lg:block lg:w-64 space-y-6 lg:sticky lg:top-[30px] lg:self-start">
            <div className="bg-white border-2 border-gray-100 shadow-sm rounded-[14px] p-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Categories</h3>
              <div className="flex flex-col gap-1">
                {categoriesLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-[10px] bg-gray-100 animate-pulse" />
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => setFilter("category", null)}
                      className={`w-full text-left px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                        !selectedCategoryId
                          ? "bg-red-600 text-white shadow-md shadow-red-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setFilter("category", cat._id)}
                        className={`w-full text-left px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                          selectedCategoryId === cat._id
                            ? "bg-red-600 text-white shadow-md shadow-red-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
            <div className="bg-white border-[2px] border-gray-100 shadow-sm rounded-[14px] p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="space-y-4">
                <Slider value={priceRange} onValueChange={setPriceRange} min={DEFAULT_PRICE_MIN} max={DEFAULT_PRICE_MAX} step={10} className="w-full" />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 relative">
            <AnimatePresence mode="wait">
              {(isLoading || (isFetching && !products.length)) ? (
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
                    <p className="text-gray-600">Showing {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total || products.length)} of {pagination.total || products.length} products</p>
                    {isFetching && (
                      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Updating...
                      </div>
                    )}
                  </div>

                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {products.map((product, index) => {
                        const price = product.price ?? 0
                        const salePercentage = product.sale ?? 0
                        const hasSale = salePercentage > 0 && salePercentage < 100
                        const salePrice = hasSale ? price * (1 - salePercentage / 100) : price
                        return (
                          <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ y: -3 }}
                            className="group cursor-pointer"
                          >
                            <Link to={`/products/${product._id}`}>
                              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
                                <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                                  <img src={buildImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  {hasSale && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                      {Math.round((1 - salePrice / price) * 100)}%
                                    </div>
                                  )}
                                </div>
                                <div className="p-3 space-y-1">
                                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</h3>
                                  <p className="text-[11px] text-gray-400 truncate">{product.category?.name || ""}</p>
                                  <div>
                                    {hasSale ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-base font-bold text-gray-900">${salePrice.toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 line-through">${price.toFixed(2)}</span>
                                      </div>
                                    ) : (
                                      <span className="text-base font-bold text-gray-900">${price.toFixed(2)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products.map((product, index) => {
                        const price = product.price ?? 0
                        const salePercentage = product.sale ?? 0
                        const hasSale = salePercentage > 0 && salePercentage < 100
                        const salePrice = hasSale ? price * (1 - salePercentage / 100) : price
                        return (
                          <motion.div
                            key={product._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                          >
                            <Link to={`/products/${product._id}`}>
                              <div className="flex items-center gap-4 p-3">
                                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                                  <img src={buildImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                                  <p className="text-xs text-gray-400 mt-0.5">{product.category?.name || ""}</p>
                                  <div className="mt-1">
                                    {hasSale ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-900">${salePrice.toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 line-through">${price.toFixed(2)}</span>
                                      </div>
                                    ) : (
                                      <span className="font-bold text-gray-900">${price.toFixed(2)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}

                  {products.length === 0 && !isFetching && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <FiSearch className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {selectedCategoryId ? "No products in this category" : "No products found"}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                        {selectedCategoryId
                          ? "Try a different category or adjust your filters."
                          : "Try adjusting your search or filters to find what you're looking for."}
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
      </div>
    </div>
  )
}
