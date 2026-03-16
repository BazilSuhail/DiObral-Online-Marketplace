import { useState, useMemo, useEffect } from "react"
import { motion } from "motion/react"
import { Link, useParams } from "react-router-dom"
import { FiSearch, FiFilter, FiGrid, FiList, FiStar } from "react-icons/fi"
import { useApiQuery } from "../api/adapter"
import Button from "../utilities/Button.jsx"
import Badge from "../utilities/Badge.jsx"
import ProductsSkeleton from "../Components/Loaders/ProductsSkeleton.jsx"

const Input = ({ className = "", ...props }) => {
  return (
    <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
  )
}

const Select = ({ children, value, onValueChange, className = "" }) => {
  return (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent ${className}`}>
      {children}
    </select>
  )
}

const Checkbox = ({ id, checked, onCheckedChange, className = "", label, labelClassName = "" }) => {
  return (
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
      {label && (
        <label htmlFor={id} className={`ml-2 text-sm font-medium text-gray-700 cursor-pointer ${labelClassName}`}>{label}</label>
      )}
    </div>
  );
};

const Slider = ({ value, onValueChange, max, step, className = "" }) => {
  return (
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
  );
};

export default function Products() {
  const { urlCategory } = useParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [priceRange, setPriceRange] = useState([500, 10000]);
  const [sortBy, setSortBy] = useState("featured");

  const { data: productsRaw, isLoading: loadingProducts } = useApiQuery("/fetchproducts/products");
  const { data: categoriesRaw } = useApiQuery("/category");
  const { data: subcategoriesRaw } = useApiQuery("/subcategories");

  const categories = useMemo(() => {
    if (!categoriesRaw || !subcategoriesRaw) return [];
    return categoriesRaw.map(cat => ({
      name: cat.name,
      subcategories: subcategoriesRaw.filter(sub => sub.category === cat.name).map(s => s.name)
    }));
  }, [categoriesRaw, subcategoriesRaw]);

  const products = productsRaw || [];

  useEffect(() => {
    setSelectedCategories(
      decodeURIComponent(urlCategory || "") === "All" || !urlCategory
        ? [] : decodeURIComponent(urlCategory)
    );
  }, [urlCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 ||
        (Array.isArray(selectedCategories) ? selectedCategories.includes(product.category) : product.category === selectedCategories);
      const matchesSubcategory = selectedSubcategories.length === 0 || selectedCategories.length === 0 || selectedSubcategories.includes(product.subcategory);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice;
    });

    switch (sortBy) {
      case "price-low": filtered.sort((a, b) => a.price - b.price); break;
      case "price-high": filtered.sort((a, b) => b.price - a.price); break;
      case "rating": filtered.sort((a, b) => b.rating - a.rating); break;
      case "newest": filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }
    return filtered;
  }, [products, searchTerm, selectedCategories, selectedSubcategories, priceRange, sortBy]);

  const handleCategoryChange = (category, checked) => {
    if (checked) {
      setSelectedCategories(prev => Array.isArray(prev) ? [...prev, category] : [category]);
    } else {
      setSelectedCategories(prev => Array.isArray(prev) ? prev.filter(c => c !== category) : []);
    }
  };

  const handleSubcategoryChange = (subcategory, checked) => {
    if (checked) setSelectedSubcategories(prev => [...prev, subcategory]);
    else setSelectedSubcategories(prev => prev.filter(s => s !== subcategory));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12">
        <div className="mb-8">
          <h1 className="text-[22px] lg:text-[30px] font-bold text-gray-900">All <span className="text-red-700">Products</span></h1>
          <p className="text-gray-600">Discover our complete collection of premium fashion and lifestyle products.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy} className="w-48">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === "grid" ? "red" : "outline"} size="sm" onClick={() => setViewMode("grid")}><FiGrid className="w-4 h-4" /></Button>
              <Button variant={viewMode === "list" ? "red" : "outline"} size="sm" onClick={() => setViewMode("list")}><FiList className="w-4 h-4" /></Button>
            </div>
            <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)} className="lg:hidden"><FiFilter className="w-4 h-4 mr-2" />Filters</Button>
          </div>
        </div>

        {loadingProducts ? <ProductsSkeleton /> : (
          <div className="flex gap-8">
            <div className={`${isFilterOpen ? "absolute left-0 z-50 w-full bg-white shadow-lg" : ""} ${isFilterOpen ? "block" : "hidden"} lg:block lg:static lg:w-64 space-y-6`}>
              <div className="bg-white border-[2px] border-gray-100 shadow-sm rounded-[14px] p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-3">
                  {(categories || []).map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={category.name}
                          checked={Array.isArray(selectedCategories) && selectedCategories.includes(category.name)}
                          onCheckedChange={(checked) => handleCategoryChange(category.name, checked)}
                          label={category.name}
                          className="mb-2"
                          labelClassName="text-sm font-medium"
                        />
                      </div>
                      {Array.isArray(selectedCategories) && selectedCategories.includes(category.name) && (
                        <div className="ml-6 mt-2 space-y-2">
                          {category.subcategories.map((sub) => (
                            <div key={sub} className="flex items-center space-x-2">
                              <Checkbox
                                id={sub}
                                checked={selectedSubcategories.includes(sub)}
                                onCheckedChange={(checked) => handleSubcategoryChange(sub, checked)}
                                label={sub}
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
                  <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={10} className="w-full" />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">Showing {filteredProducts.length} of {products.length} products</p>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
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
                            <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${product.image}`} alt={product.name} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {product.sale > 0 && <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">Sale</Badge>}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">${product.price}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-100 p-4"
                    >
                      <Link to={`/products/${product._id}`}>
                        <div className="flex gap-4">
                          <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${product.image}`} alt={product.name} className="w-[120px] border-[2px] border-gray-200 rounded-[14px] object-cover" />
                          <div className="flex-1">
                            <div className="flex items-center my-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{product.category} • {product.subcategory}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">${product.price}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                  <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategories([]); setSelectedSubcategories([]); setPriceRange([0, 10000]); }} className="mt-4">Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
