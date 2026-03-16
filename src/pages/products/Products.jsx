import { useState, useMemo, useEffect, useCallback } from "react"
import { motion } from "motion/react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { FiSearch, FiFilter, FiGrid, FiList, FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { useApiQuery } from "../../api/adapter"
import { API_BASE_URL } from "../../api/client"
import Button from "../../utilities/Button.jsx"
import Badge from "../../utilities/Badge.jsx"
import ProductsSkeleton from "../../components/loaders/ProductsSkeleton.jsx"

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

const Slider = ({ value, onValueChange, max, step, className = "" }) => (
  <input
    type="range" min="0" max={max} step={step}
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

export default function Products() {
  const { urlCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const params = { page, limit: 20 };
    if (searchTerm) params.search = searchTerm;
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (priceRange[0] > 0) params.minPrice = priceRange[0];
    if (priceRange[1] < 10000) params.maxPrice = priceRange[1];
    const sortMap = { "price-low": "price_asc", "price-high": "price_desc", rating: "rating", newest: "newest", popular: "popular" };
    if (sortBy !== "featured") params.sort = sortMap[sortBy] || sortBy;
    return params;
  }, [page, searchTerm, selectedCategoryId, priceRange, sortBy]);

  const { data: productsRes, isLoading } = useApiQuery("/api/products", queryParams);
  const { data: categoriesRaw } = useApiQuery("/categories");

  const products = productsRes?.products || [];
  const pagination = productsRes?.pagination || {};

  const categories = useMemo(() => {
    if (!categoriesRaw) return [];
    const buildTree = (items, parentId = null) =>
      items.filter(c => c.parent === parentId || (!c.parent && !parentId)).map(c => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        children: c.children || buildTree(items, c._id),
      }));
    return buildTree(categoriesRaw);
  }, [categoriesRaw]);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) setSearchTerm(search);
  }, [searchParams]);

  useEffect(() => {
    if (urlCategory && categories.length) {
      const found = categories.find(c => c.name.toLowerCase() === decodeURIComponent(urlCategory).toLowerCase());
      if (found) setSelectedCategoryId(found._id);
    }
  }, [urlCategory, categories]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    if (e.target.value) setSearchParams({ search: e.target.value });
    else setSearchParams({});
  }, [setSearchParams]);

  const sortMap = { "price-low": "price_asc", "price-high": "price_desc", rating: "rating", newest: "newest", popular: "popular" };
  const sortReverse = Object.fromEntries(Object.entries(sortMap).map(([k, v]) => [v, k]));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12">
        <div className="mb-8">
          <h1 className="text-[22px] lg:text-[30px] font-bold text-gray-900">All <span className="text-red-700">Products</span></h1>
          <p className="text-gray-600">Discover our complete collection of premium products.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input placeholder="Search products..." value={searchTerm} onChange={handleSearch} className="pl-10" />
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }} className="w-48">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === "grid" ? "red" : "outline"} size="sm" onClick={() => setViewMode("grid")}><FiGrid className="w-4 h-4" /></Button>
              <Button variant={viewMode === "list" ? "red" : "outline"} size="sm" onClick={() => setViewMode("list")}><FiList className="w-4 h-4" /></Button>
            </div>
            <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)} className="lg:hidden"><FiFilter className="w-4 h-4 mr-2" />Filters</Button>
          </div>
        </div>

        {isLoading ? <ProductsSkeleton /> : (
          <div className="flex gap-8">
            <div className={`${isFilterOpen ? "absolute left-0 z-50 w-full bg-white shadow-lg p-4" : ""} ${isFilterOpen ? "block" : "hidden"} lg:block lg:static lg:w-64 space-y-6`}>
              <div className="bg-white border-[2px] border-gray-100 shadow-sm rounded-[14px] p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all"
                      checked={!selectedCategoryId}
                      onCheckedChange={() => { setSelectedCategoryId(null); setPage(1); }}
                      label="All Categories"
                      className="mb-2"
                      labelClassName="text-sm font-medium"
                    />
                  </div>
                  {categories.map((cat) => (
                    <div key={cat._id}>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={cat._id}
                          checked={selectedCategoryId === cat._id}
                          onCheckedChange={(checked) => { setSelectedCategoryId(checked ? cat._id : null); setPage(1); }}
                          label={cat.name}
                          className="mb-2"
                          labelClassName="text-sm font-medium"
                        />
                      </div>
                      {selectedCategoryId === cat._id && cat.children?.length > 0 && (
                        <div className="ml-6 mt-2 space-y-2">
                          {cat.children.map((sub) => (
                            <div key={sub._id} className="flex items-center space-x-2">
                              <Checkbox
                                id={sub._id}
                                checked={selectedCategoryId === sub._id}
                                onCheckedChange={(checked) => { setSelectedCategoryId(checked ? sub._id : null); setPage(1); }}
                                label={sub.name}
                                className="mb-2"
                                labelClassName="text-sm font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border-[2px] border-gray-100 shadow-sm rounded-[14px] p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <Slider value={priceRange} onValueChange={(v) => { setPriceRange(v); setPage(1); }} max={10000} step={10} className="w-full" />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total || products.length)} of {pagination.total || products.length} products</p>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => {
                    const price = product.price ?? 0
                    const salePrice = product.sale ?? 0
                    const hasSale = salePrice > 0 && salePrice < price
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="group cursor-pointer"
                      >
                        <Link to={`/products/${product._id}`}>
                          <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
                            <div className="relative">
                              <img src={buildImageUrl(product.image)} alt={product.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                              {hasSale && <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">Sale</Badge>}
                            </div>
                            <div className="p-4">
                              <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className={`w-4 h-4 ${i < Math.floor(product.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500 ml-2">({product.totalReviews ?? 0})</span>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                              <p className="text-sm text-gray-500 mb-2">{product.category?.name || product.store?.storeName || ""}</p>
                              <div className="flex items-center space-x-2">
                                {hasSale ? (
                                  <>
                                    <span className="text-lg font-bold text-gray-900">${salePrice.toFixed(2)}</span>
                                    <span className="text-sm text-gray-400 line-through">${price.toFixed(2)}</span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
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
                <div className="space-y-4">
                  {products.map((product, index) => {
                    const price = product.price ?? 0
                    const salePrice = product.sale ?? 0
                    const hasSale = salePrice > 0 && salePrice < price
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-100 p-4"
                      >
                        <Link to={`/products/${product._id}`}>
                          <div className="flex gap-4">
                            <img src={buildImageUrl(product.image)} alt={product.name} className="w-[120px] h-[120px] border-[2px] border-gray-200 rounded-[14px] object-cover" />
                            <div className="flex-1">
                              <div className="flex items-center my-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className={`w-4 h-4 ${i < Math.floor(product.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500 ml-2">({product.totalReviews ?? 0})</span>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                              <p className="text-sm text-gray-500 mb-2">{product.category?.name || ""}</p>
                              <div className="flex items-center space-x-2">
                                {hasSale ? (
                                  <>
                                    <span className="text-lg font-bold text-gray-900">${salePrice.toFixed(2)}</span>
                                    <span className="text-sm text-gray-400 line-through">${price.toFixed(2)}</span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
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

              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                  <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategoryId(null); setPriceRange([0, 10000]); setSearchParams({}); }} className="mt-4">Clear Filters</Button>
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-red-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>
                      {p}
                    </button>
                  ))}
                  <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
