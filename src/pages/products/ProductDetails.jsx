import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  FiStar, FiShoppingBag, FiShare2, FiChevronLeft, FiChevronRight,
  FiPlus, FiMinus, FiCheck, FiHeart, FiTag, FiGrid, FiBox,
  FiTruck, FiShield, FiRotateCcw, FiClock, FiDollarSign,
  FiUser, FiPackage, FiArrowRight,
} from "react-icons/fi"
import { Link, useNavigate, useParams } from "react-router-dom"
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
  { icon: FiTruck, label: "Free Shipping", desc: "Orders over $50" },
  { icon: FiShield, label: "Secure Checkout", desc: "SSL encrypted" },
  { icon: FiRotateCcw, label: "Easy Returns", desc: "30-day policy" },
]

function StarRating({ rating = 0, size = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className={`${size} ${i < Math.floor(rating) ? "text-red-500 fill-current" : "text-gray-200 fill-current"}`}
        />
      ))}
    </div>
  )
}

function Container({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}
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
  const checkWishlist = useWishlistStore((s) => s.checkWishlist)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)

  const { data: res, isLoading } = useApiQuery(`/api/products/${id}`)
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
  if (!product) return null

  const price = product.price ?? 0
  const salePrice = product.sale ?? 0
  const hasSale = salePrice > 0 && salePrice < price
  const displayPrice = hasSale ? salePrice : price
  const savings = hasSale ? price - salePrice : 0
  const currentSize = selectedSize || product.size?.[0] || null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-gray-400 mb-6"
        >
          <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link to="/productlist/All" className="hover:text-red-600 transition-colors">Products</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-red-700 font-semibold truncate">{product.name}</span>
        </motion.nav>

        {/* Main section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left — Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-6 lg:self-start">
            <Container className="p-3 sm:p-4">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="relative bg-gray-50 rounded-lg overflow-hidden group"
              >
                <img
                  src={buildImageUrl(images[selectedImage] || product.image)}
                  alt={product.name}
                  className="w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover"
                />
                {hasSale && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-red-600/30 flex items-center gap-1.5"
                  >
                    <FiTag className="w-3 h-3" />
                    {Math.round((1 - salePrice / price) * 100)}% OFF
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={async () => {
                    if (!isAuthenticated) { navigate("/signin"); return }
                    const res = await toggleWishlist(id)
                    if (res !== null) setWishlisted(res)
                  }}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                    wishlisted ? "bg-red-500 text-white" : "bg-white/90 hover:bg-white text-gray-400 hover:text-red-500"
                  }`}
                >
                  <FiHeart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                </motion.button>

                {images.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedImage(i => i > 0 ? i - 1 : images.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiChevronLeft className="w-4 h-4 text-gray-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedImage(i => i < images.length - 1 ? i + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiChevronRight className="w-4 h-4 text-gray-700" />
                    </motion.button>
                  </>
                )}
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <FiBox className="w-3 h-3" />
                  {selectedImage + 1} / {images.length}
                </div>
              </motion.div>

              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === index
                          ? "border-red-500 ring-2 ring-red-500/20 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img src={buildImageUrl(image)} alt="" className="w-16 sm:w-20 h-16 sm:h-20 object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </Container>
          </div>

          {/* Right — Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Container className="p-5 sm:p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Category + Name */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                      <FiTag className="w-3 h-3" />
                      {product.category?.name || "General"}
                    </span>
                    {hasSale && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                        <FiDollarSign className="w-3 h-3" />
                        Save ${savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Store + Rating */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {product.store ? (
                    <Link
                      to={`/stores/${product.store.slug}`}
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-bold text-white shadow-sm"
                      >
                        {product.store.storeName?.charAt(0)}
                      </motion.div>
                      <span className="font-medium group-hover:text-red-600">{product.store.storeName}</span>
                      <FiArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                      <FaStore className="w-4 h-4" /> No store
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <StarRating rating={product.rating || 0} />
                    <span className="text-sm font-semibold text-gray-900">{(product.rating || 0).toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({product.totalReviews || 0})</span>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Price */}
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
                  {hasSale && (
                    <>
                      <span className="text-lg text-gray-300 line-through">${price.toFixed(2)}</span>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg"
                      >
                        -{Math.round((1 - salePrice / price) * 100)}%
                      </motion.span>
                    </>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-gray-500 leading-relaxed text-sm">{product.description}</p>
                )}

                {/* Tags */}
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                        <FiTag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100" />

                {/* Size */}
                {product.size?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FiGrid className="w-4 h-4 text-red-500" />
                      Size <span className="text-gray-400 font-normal">— {currentSize}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.size.map((size) => (
                        <motion.button
                          key={size}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-12 rounded-lg border text-sm font-semibold transition-all ${
                            currentSize === size
                              ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-600 shadow-lg shadow-red-600/20"
                              : "bg-white text-gray-600 border-gray-200 hover:border-red-400 hover:text-red-600 hover:shadow-sm"
                          }`}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity + Add to Cart */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      <FiMinus className="w-3.5 h-3.5" />
                    </motion.button>
                    <span className="w-12 text-center text-sm font-bold text-gray-900">{quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                      className="w-10 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>

                  {isAuthenticated ? (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleAddToCart}
                      className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                    >
                      <FiShoppingBag className="w-4 h-4" /> Add to Cart
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => navigate("/signin")}
                      className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                    >
                      <FiUser className="w-4 h-4" /> Sign in to Buy
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyLink}
                    className="w-11 h-11 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-300 transition-all flex-shrink-0 bg-white"
                  >
                    <FiShare2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2 text-xs">
                  {product.stock > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-green-700 font-medium">{product.stock} in stock</span>
                      <FiClock className="w-3 h-3 text-gray-300 ml-1" />
                      <span className="text-gray-400">Ready to ship</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-red-600 font-medium">Out of stock</span>
                    </>
                  )}
                </div>
              </motion.div>
            </Container>

            {/* Guarantees */}
            <Container className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {guaranteeItems.map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ y: -2 }}
                    className="flex flex-col items-center text-center gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </Container>
          </div>
        </div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6"
        >
          <Container className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <FiStar className="w-5 h-5 text-red-500 fill-current" />
              Customer Reviews
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              See what others are saying about this product
            </p>
            <ReviewSection productId={id} />
          </Container>
        </motion.div>

        {/* Related */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6"
          >
            <Container className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-red-500" />
                  You might also like
                </h2>
                <Link
                  to="/productlist/All"
                  className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  View All <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((rp, i) => {
                  const rPrice = rp.price ?? 0
                  const rSale = rp.sale ?? 0
                  const rHasSale = rSale > 0 && rSale < rPrice
                  return (
                    <Link key={rp._id} to={`/products/${rp._id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all overflow-hidden"
                      >
                        <div className="relative overflow-hidden bg-gray-50">
                          <img
                            src={buildImageUrl(rp.image)}
                            alt={rp.name}
                            className="w-full h-40 sm:h-44 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {rHasSale && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                              <FiTag className="w-2.5 h-2.5" /> Sale
                            </div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiHeart className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
                          </motion.button>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold text-gray-800 truncate">{rp.name}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {rHasSale ? (
                              <>
                                <span className="text-sm font-bold text-red-600">${rSale.toFixed(2)}</span>
                                <span className="text-xs text-gray-300 line-through">${rPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-gray-900">${rPrice.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <StarRating rating={rp.rating || 0} size="w-3 h-3" />
                            <span className="text-[10px] text-gray-400">({rp.totalReviews || 0})</span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </Container>
          </motion.div>
        )}
      </div>

      {/* Copied toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 bg-white border border-gray-200 text-gray-800 px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-sm font-medium"
          >
            <FiCheck className="w-4 h-4 text-green-500" /> Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
