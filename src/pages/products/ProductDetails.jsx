import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  FiStar, FiShoppingBag, FiShare2, FiChevronLeft, FiChevronRight,
  FiPlus, FiMinus, FiCheck, FiHeart, FiTag, FiGrid, FiBox,
  FiTruck, FiShield, FiRotateCcw, FiClock, FiDollarSign,
  FiUser, FiPackage, FiArrowRight, FiX, FiMaximize2,
} from "react-icons/fi"
import { Link, useNavigate, useParams } from "react-router-dom"
import Button from "../../components/ui/Button.jsx"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"
import { useWishlistStore } from "../../store/wishlistStore"
import { useApiQuery } from "../../api/adapter"
import { API_BASE_URL } from "../../api/client"
import ReviewSection from "../../components/productReview/ProductReview"
import ProductDetailSkeleton from "../../components/loaders/ProductDetailSkeleton"
import { FaStore } from "react-icons/fa6"

function buildImageUrl(image) {
  if (!image) return "/placeholder.png"
  if (image.startsWith("http")) return image
  return `${API_BASE_URL}/uploads/${image}`
}

const guaranteeItems = [
  { icon: FiTruck, label: "Free Shipping", desc: "For orders over $50" },
  { icon: FiShield, label: "Secure Checkout", desc: "Protected by SSL" },
  { icon: FiRotateCcw, label: "Easy Returns", desc: "30-day return policy" },
]

function StarRating({ rating = 0, size = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className={`${size} ${i < Math.floor(rating) ? "text-amber-400 fill-current" : "text-gray-200"}`}
        />
      ))}
    </div>
  )
}

function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addToCart = useCartStore((s) => s.addToCart)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null)
  const [copied, setCopied] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [showAllDetails, setShowAllDetails] = useState(false)
  const checkWishlist = useWishlistStore((s) => s.checkWishlist)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)

  const { data: res, isLoading, isError, error } = useApiQuery(`/api/products/${id}`)
  const product = res?.product || null
  const related = res?.related || []

  useEffect(() => {
    if (id && isAuthenticated) checkWishlist(id).then(setWishlisted)
  }, [id, isAuthenticated, checkWishlist])

  const images = product
    ? [product.image, ...(product.otherImages?.filter(img => img !== product.image) || [])]
    : []

  useEffect(() => {
    if (product?.size?.length && !selectedSize) {
      setSelectedSize(product.size[0])
    }
  }, [product, selectedSize])

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate("/signin"); return }
    if (product) {
      addToCart({ id: product._id, quantity, size: selectedSize || product.size?.[0] })
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
      .catch(() => {
        const ta = document.createElement("textarea")
        ta.value = window.location.href
        document.body.appendChild(ta); ta.select(); document.execCommand("copy")
        document.body.removeChild(ta)
        setCopied(true); setTimeout(() => setCopied(false), 2000)
      })
  }

  if (isLoading) return <ProductDetailSkeleton />
  if (isError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
            <FiX className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
            {error?.response?.status === 404
              ? "This product doesn't exist or has been removed."
              : "Something went wrong while loading this product. Please try again."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            <Button variant="red" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </main>
    )
  }
  if (!product) return null

  const price = product.price ?? 0
  const salePercentage = product.sale ?? 0
  const hasSale = salePercentage > 0 && salePercentage < 100
  const salePrice = hasSale ? price * (1 - salePercentage / 100) : price
  const displayPrice = hasSale ? salePrice : price
  const savings = hasSale ? price - salePrice : 0
  const currentSize = selectedSize || product.size?.[0] || null

  return (
    <main className="min-h-screen bg-slate-50/40 text-gray-800 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Minimalist Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-6"
        >
          <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3 text-gray-300" />
          <Link to="/productlist/all" className="hover:text-red-600 transition-colors">Products</Link>
          <FiChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </motion.nav>

        {/* Main Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column — 4:5 Image Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-8">
            <Card className="p-3 sm:p-4">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative bg-gray-50/80 rounded-xl overflow-hidden group aspect-4/5 w-full"
              >
                <img
                  src={buildImageUrl(images[selectedImage] || product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Sale Badge */}
                {hasSale && (
                  <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <FiTag className="w-3 h-3" />
                    {Math.round((1 - salePrice / price) * 100)}% OFF
                  </div>
                )}

                {/* Floating Wishlist Heart */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={async () => {
                    if (!isAuthenticated) { navigate("/signin"); return }
                    const res = await toggleWishlist(id)
                    if (res !== null) setWishlisted(res)
                  }}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all ${
                    wishlisted ? "bg-red-600 text-white" : "bg-white/80 hover:bg-white text-gray-500 hover:text-red-600"
                  }`}
                >
                  <FiHeart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                </motion.button>

                {/* Navigation Arrows for Gallery */}
                {images.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedImage(i => i > 0 ? i - 1 : images.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-gray-700"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedImage(i => i < images.length - 1 ? i + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-gray-700"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </motion.button>
                  </>
                )}

                {/* Counter */}
                <div className="absolute bottom-4 right-4 bg-gray-900/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                  <FiBox className="w-3 h-3" />
                  {selectedImage + 1} / {images.length}
                </div>
              </motion.div>

              {/* 4:5 Aspect Ratio Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all aspect-[4/5] w-16 sm:w-20 ${
                        selectedImage === index
                          ? "border-red-600 ring-2 ring-red-600/20 shadow-sm"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={buildImageUrl(image)} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column — Product Details & Interaction */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Card className="p-6 sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Category & Stock Pill */}
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                      <FiTag className="w-3 h-3" />
                      {product.category?.name || "General"}
                    </span>
                    {hasSale && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <FiDollarSign className="w-3 h-3" /> Save ${savings.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Store link & Rating */}
                <div className="flex items-center justify-between flex-wrap gap-3 py-2 border-y border-gray-100">
                  {product.store ? (
                    <Link
                      to={`/stores/${product.store.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-red-600 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shadow-sm text-xs">
                        {product.store.storeName?.charAt(0)}
                      </div>
                      <span>{product.store.storeName}</span>
                      <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs text-gray-400">
                      <FaStore className="w-3.5 h-3.5" /> Direct Merchant
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <StarRating rating={product.rating || 0} />
                    <span className="text-xs font-bold text-gray-900">{(product.rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({product.totalReviews || 0} reviews)</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-gray-900 tracking-tight">${displayPrice.toFixed(2)}</span>
                  {hasSale && (
                    <span className="text-base text-gray-400 line-through font-medium">${price.toFixed(2)}</span>
                  )}
                </div>

                {/* Description Snippet */}
                {typeof product.description === "string" && product.description.trim() && (
                  <div className="space-y-2">
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {product.description.length > 140
                        ? product.description.slice(0, 140) + "..."
                        : product.description
                      }
                    </p>
                    {product.description.length > 140 && (
                      <button
                        onClick={() => setShowAllDetails(true)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                      >
                        <FiMaximize2 className="w-3 h-3" /> Read full description
                      </button>
                    )}
                  </div>
                )}

                {/* Size Selector */}
                {product.size?.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <FiGrid className="w-3.5 h-3.5 text-red-600" />
                        Select Size
                      </span>
                      <span className="text-gray-400 font-normal">{currentSize}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.size.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-11 h-11 rounded-xl text-xs font-bold transition-all duration-200 ${
                            currentSize === size
                              ? "bg-gray-900 text-white shadow-md"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/60"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Actions */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 p-1">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-600"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-600"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleAddToCart}
                      className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
                    >
                      <FiShoppingBag className="w-4 h-4" /> Add to Cart
                    </motion.button>

                    {/* Share Link */}
                    <button
                      onClick={copyLink}
                      className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors bg-white"
                      title="Share product"
                    >
                      <FiShare2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stock Availability */}
                  <div className="flex items-center gap-2 text-xs">
                    {product.stock > 0 ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-700 font-semibold">{product.stock} items available in stock</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-rose-600 font-semibold">Currently Out of Stock</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </Card>

            {/* Minimalist Guarantees Bar */}
            <Card className="p-4 bg-white">
              <div className="grid grid-cols-3 gap-2">
                {guaranteeItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/60"
                  >
                    <item.icon className="w-4 h-4 text-red-600 mb-1" />
                    <p className="text-xs font-bold text-gray-800">{item.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Product Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <FiStar className="w-5 h-5 text-amber-400 fill-current" />
              Customer Ratings & Reviews
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Verified customer feedback and experiences
            </p>
            <ReviewSection productId={id} modal={false} />
          </Card>
        </motion.div>

        {/* Related Products Carousel Grid — All 4:5 Aspect Ratio Images */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10"
          >
            <Card className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-red-600" />
                  You Might Also Like
                </h2>
                <Link
                  to="/productlist/all"
                  className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  Explore All <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {related.map((rp, i) => {
                  const rPrice = rp.price ?? 0
                  const rSalePercentage = rp.sale ?? 0
                  const rHasSale = rSalePercentage > 0 && rSalePercentage < 100
                  const rSale = rHasSale ? rPrice * (1 - rSalePercentage / 100) : rPrice
                  return (
                    <Link key={rp._id} to={`/products/${rp._id}`}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                      >
                        {/* Related Product Image — Strict 4:5 Aspect Ratio */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                          <img
                            src={buildImageUrl(rp.image)}
                            alt={rp.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {rHasSale && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                              Sale
                            </div>
                          )}
                        </div>
                        <div className="p-3.5 space-y-1">
                          <p className="text-xs font-bold text-gray-900 truncate">{rp.name}</p>
                          <div className="flex items-center gap-1.5">
                            {rHasSale ? (
                              <>
                                <span className="text-xs font-bold text-red-600">${rSale.toFixed(2)}</span>
                                <span className="text-[10px] text-gray-400 line-through">${rPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="text-xs font-bold text-gray-900">${rPrice.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 pt-0.5">
                            <StarRating rating={rp.rating || 0} size="w-3 h-3" />
                            <span className="text-[10px] text-gray-400">({rp.totalReviews || 0})</span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Full Details Modal */}
      <AnimatePresence>
        {showAllDetails && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllDetails(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-x-4 top-[8%] max-w-xl mx-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-100 max-h-[80vh] flex flex-col"
            >
              <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FiMaximize2 className="w-4 h-4 text-red-600" />
                  Product Information & Specifications
                </h3>
                <button
                  onClick={() => setShowAllDetails(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-700">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product Title</p>
                  <p className="font-bold text-sm text-gray-900">{product.name}</p>
                </div>
                {typeof product.description === "string" && product.description.trim() && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Description</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Category</p>
                    <p className="font-medium text-gray-900">{product.category?.name || "General"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Merchant Store</p>
                    <p className="font-medium text-gray-900">{product.store?.storeName || "DiObral Marketplace"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Copied Link Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold"
          >
            <FiCheck className="w-4 h-4 text-emerald-400" /> Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

