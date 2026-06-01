import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  FiHome, FiChevronRight, FiTag, FiCheck, FiX, FiMaximize2,
  FiArrowLeft, FiRefreshCw, FiMessageSquare,
} from "react-icons/fi"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useWishlistStore } from "../../store/wishlistStore"
import { useApiQuery } from "../../api/adapter"
import { API_BASE_URL } from "../../api/client"
import ReviewSection from "../../components/productReview/ProductReview"
import ProductDetailSkeleton from "../../components/loaders/ProductDetailSkeleton"
import NotFound from "../../components/illustrations/NotFound"
import ErrorState from "../../components/illustrations/ErrorState"
import Gallery from "../../components/productDetails/Gallery"
import StarRating from "../../components/productDetails/StarRating"
import { HangerSvg } from "../../components/productDetails/svgs"
import {
  PriceBlock, SizeSelector, QuantityStepper, AddToCartButton, StockNotice,
  ShippingProgress, DeliveryEstimate,
} from "../../components/productDetails/PurchaseParts"
import { useAddToCart } from "../../components/productDetails/useAddToCart"
import {
  StoreCard, TrustGrid, DetailsAccordion, RelatedCarousel, StickyCartBar,
} from "../../components/productDetails/Sections"

const EASE = [0.22, 1, 0.36, 1]

function buildImageUrl(image) {
  if (!image) return "/placeholder.png"
  if (image.startsWith("http")) return image
  return `${API_BASE_URL}/uploads/${image}`
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const cardCls = "soft-card rounded-3xl p-5 sm:p-7"

function Reveal({ children, className = "" }) {
  const reduce = useReducedMotion()
  return (
    <motion.section
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const checkWishlist = useWishlistStore((s) => s.checkWishlist)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)

  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null)
  const [copied, setCopied] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [showAllDetails, setShowAllDetails] = useState(false)
  const [showSticky, setShowSticky] = useState(false)

  const imageRef = useRef(null)
  const ctaRef = useRef(null)

  const { data: res, isLoading, isError, error } = useApiQuery(`/api/products/${id}`)
  const product = res?.product || null
  const related = res?.related || []

  useEffect(() => {
    if (id && isAuthenticated) checkWishlist(id).then(setWishlisted)
  }, [id, isAuthenticated, checkWishlist])

  // Reset selections per product; only auto-select when exactly one size exists.
  useEffect(() => {
    setQuantity(1)
    setSelectedSize(product?.size?.length === 1 ? product.size[0] : null)
  }, [product?._id]) // eslint-disable-line react-hooks/exhaustive-deps

  const images = product
    ? [product.image, ...(product.otherImages?.filter((img) => img !== product.image) || [])]
    : []
  const imageUrls = images.map(buildImageUrl)
  const stock = product?.stock ?? 0
  const soldOut = stock <= 0
  const hasSizes = (product?.size?.length || 0) > 0

  const { state, run, sizeError, shakeKey, toastNode } = useAddToCart({
    product, quantity, size: selectedSize, imageRef, imgSrc: imageUrls[0],
  })

  // Sticky bar: show once the CTA row has scrolled above the viewport.
  useEffect(() => {
    const el = ctaRef.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: "0px 0px -40px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [product?._id])

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

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) { navigate("/signin"); return }
    const r = await toggleWishlist(id)
    if (r !== null) setWishlisted(r)
  }

  const goReviews = (e) => {
    e.preventDefault()
    document.getElementById("reviews")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }

  if (isLoading) return <ProductDetailSkeleton />
  if (isError) {
    const notFound = error?.response?.status === 404
    return (
      <main className="soft-page flex items-center justify-center px-4 py-10">
        <div className="soft-card flex w-full max-w-lg flex-col items-center rounded-3xl px-6 py-12 text-center">
          {notFound ? <NotFound size={220} className="mb-6" /> : <ErrorState size={220} className="mb-6" />}
          <h2 className="text-xl font-semibold text-gray-900">
            {notFound ? "Product not found" : "We couldn't load this product"}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            {notFound
              ? "This item may have been removed or sold out."
              : "Something went wrong while loading this product. Please try again."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="soft-btn soft-btn-ghost">
              <FiArrowLeft className="h-4 w-4" /> Go back
            </button>
            <button type="button" onClick={() => window.location.reload()} className="soft-btn soft-btn-primary">
              <FiRefreshCw className="h-4 w-4" /> Try again
            </button>
            <Link to="/productlist/all" className="text-sm font-semibold text-red-600 hover:text-red-700">
              Browse products
            </Link>
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
  const salePct = hasSale ? Math.round((1 - salePrice / price) * 100) : 0
  const rating = product.rating || 0
  const reviewCount = product.totalReviews || 0
  const hasDescription = typeof product.description === "string" && product.description.trim()
  const ctaLabel = hasSizes && !selectedSize ? "Select a size" : "Add to cart"
  const categoryName = product.category?.name || "General"

  return (
    <main className="soft-page text-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:py-8">

        {/* Breadcrumb */}
        <motion.nav
          aria-label="Breadcrumb"
          initial={{ opacity: 0, x: reduce ? 0 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs font-medium text-gray-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mb-6"
        >
          <Link to="/" className="flex items-center gap-1 hover:text-red-600"><FiHome className="h-3.5 w-3.5" /> Home</Link>
          <FiChevronRight className="h-3 w-3 shrink-0 text-gray-400" />
          <Link to="/productlist/all" className="hover:text-red-600">Products</Link>
          <FiChevronRight className="h-3 w-3 shrink-0 text-gray-400" />
          <span>{categoryName}</span>
          <FiChevronRight className="h-3 w-3 shrink-0 text-gray-400" />
          <span className="max-w-[200px] truncate font-semibold text-gray-900 sm:max-w-xs">{product.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">

          {/* Gallery */}
          <div className="-mx-4 sm:-mx-6 lg:col-span-7 lg:mx-0 lg:sticky lg:top-24">
            <Gallery
              images={imageUrls}
              name={product.name}
              hasSale={hasSale}
              salePct={salePct}
              wishlisted={wishlisted}
              onToggleWishlist={handleToggleWishlist}
              onShare={copyLink}
              copied={copied}
              imageRef={imageRef}
            />
            {soldOut && (
              <p className="mt-3 px-4 text-center text-xs font-medium text-gray-500 sm:px-6 lg:px-0 lg:text-left">
                Save to wishlist to find it later
              </p>
            )}
          </div>

          {/* Right column */}
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="flex flex-col gap-5 lg:col-span-5"
          >
            {/* Info */}
            <motion.div variants={rise} className={cardCls}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="soft-chip inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold">
                  <FiTag className="h-3 w-3" /> {categoryName}
                </span>
                <StockNotice stock={stock} />
              </div>
              <h1 className="text-2xl font-semibold leading-snug tracking-tight text-gray-900 sm:text-3xl">
                {product.name}
              </h1>

              <a href="#reviews" onClick={goReviews} className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm">
                <StarRating rating={rating} />
                {reviewCount > 0 ? (
                  <span className="font-semibold text-gray-700 underline-offset-2 hover:underline">
                    {rating.toFixed(1)} · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                ) : (
                  <span className="text-gray-500 underline-offset-2 hover:underline">No reviews yet — be the first</span>
                )}
              </a>

              <div className="mt-3">
                <PriceBlock price={price} displayPrice={displayPrice} hasSale={hasSale} salePct={salePct} savings={savings} />
              </div>

              {hasDescription && (
                <div className="mt-4 space-y-1">
                  <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">{product.description}</p>
                  <button
                    type="button"
                    onClick={() => setShowAllDetails(true)}
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    <FiMaximize2 className="h-3.5 w-3.5" /> Read full details
                  </button>
                </div>
              )}
            </motion.div>

            {/* Purchase */}
            <motion.div variants={rise} className={`${cardCls} space-y-5`}>
              {hasSizes && (
                <div id="size-selector" className="scroll-mt-28">
                  <SizeSelector
                    sizes={product.size}
                    value={selectedSize}
                    onChange={setSelectedSize}
                    error={sizeError}
                    shakeKey={shakeKey}
                  />
                </div>
              )}

              {soldOut && (
                <div className="soft-card-inset flex flex-col items-center rounded-2xl px-4 py-5 text-center">
                  <HangerSvg size={96} />
                  <p className="mt-1 text-sm font-semibold text-gray-900">Sold out for now</p>
                </div>
              )}

              <div ref={ctaRef} className="flex items-stretch gap-3">
                <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, stock)} disabled={soldOut} />
                <AddToCartButton state={state} onClick={run} disabled={soldOut} soldOut={soldOut} label={ctaLabel} />
              </div>

              {!soldOut && <ShippingProgress subtotal={displayPrice * quantity} />}
              <DeliveryEstimate />
            </motion.div>

            {/* Store: after purchase on desktop, after trust on mobile */}
            <motion.div variants={rise} className={`${cardCls} order-4 lg:order-3`}>
              <StoreCard store={product.store} />
            </motion.div>

            {/* Trust */}
            <motion.div variants={rise} className={`${cardCls} order-3 lg:order-4`}>
              <TrustGrid />
            </motion.div>
          </motion.div>
        </div>

        {/* Details accordion */}
        <Reveal className="mt-8 lg:mt-10">
          <div className={cardCls}>
            <DetailsAccordion description={hasDescription ? product.description : ""} onOpenModal={() => setShowAllDetails(true)} />
          </div>
        </Reveal>

        {/* Reviews */}
        <Reveal className="mt-8 lg:mt-10">
          <div id="reviews" className={`${cardCls} scroll-mt-24`}>
            <h2 className="soft-section-title text-xl font-semibold text-gray-900">
              <span className="soft-icon-tile soft-icon-tile-sm"><FiMessageSquare className="h-4 w-4" /></span>
              Customer ratings &amp; reviews
            </h2>
            <p className="mb-6 mt-1 text-xs text-gray-500">Verified customer feedback and experiences</p>
            <ReviewSection productId={id} modal={false} />
          </div>
        </Reveal>

        {/* Related */}
        {related.length > 0 && (
          <Reveal className="mt-8 lg:mt-10">
            <RelatedCarousel items={related} toUrl={buildImageUrl} />
          </Reveal>
        )}
      </div>

      <StickyCartBar
        visible={showSticky}
        name={product.name}
        imgSrc={imageUrls[0]}
        displayPrice={displayPrice}
        size={selectedSize}
        state={state}
        onAdd={run}
        disabled={soldOut}
        soldOut={soldOut}
        label={ctaLabel}
      />

      {toastNode}

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
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
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
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Product Title</p>
                  <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                </div>
                {hasDescription && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Full Description</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Category</p>
                    <p className="font-medium text-gray-900">{product.category?.name || "General"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Merchant Store</p>
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
