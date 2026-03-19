import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { FiChevronRight, FiPercent, FiPackage, FiShoppingBag, FiCheck, FiArrowRight, FiTruck, FiShield, FiRotateCcw, FiX, FiClock } from "react-icons/fi"
import { useApiQuery } from "../../api/adapter"
import { API_BASE_URL } from "../../api/client"
import Button from "../../components/ui/Button.jsx"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"
import { normalizeTags } from "../../lib/utils"

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

function Skeleton() {
  return (
    <main className="min-h-screen bg-slate-50/40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="h-4 bg-gray-200 rounded w-72 animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-3 sm:p-4">
              <div className="aspect-[4/5] bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-24 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function BundleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addToCart = useCartStore((s) => s.addToCart)

  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const { data: bundle, isLoading, isError, error } = useApiQuery(`/bundles/public/${id}`)

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate("/signin"); return }
    if (!bundle) return
    setAdding(true)
    await addToCart({ bundleId: bundle._id, quantity: 1 })
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  if (isLoading) return <Skeleton />

  if (isError || !bundle) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
            <FiX className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bundle Not Found</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
            {error?.response?.status === 404
              ? "This bundle doesn't exist, has expired, or isn't available yet."
              : "Something went wrong while loading this bundle. Please try again."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            <Button variant="red" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </main>
    )
  }

  const totalItems = (bundle.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0)
  const outOfStock = bundle.stock > 0 && 1 > bundle.stock

  return (
    <main className="min-h-screen bg-slate-50/40 text-gray-800 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-6"
        >
          <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3 text-gray-300" />
          <Link to="/bundles" className="hover:text-red-600 transition-colors">Bundles</Link>
          <FiChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{bundle.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 lg:sticky lg:top-8">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative bg-gray-50/80 rounded-xl overflow-hidden aspect-[4/5] w-full"
              >
                <img src={buildImageUrl(bundle.image)} alt={bundle.name} className="w-full h-full object-cover" />
                {bundle.youSavePercent > 0 && (
                  <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <FiPercent className="w-3 h-3" /> {bundle.youSavePercent}% OFF
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-gray-900/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                  <FiPackage className="w-3 h-3" /> {totalItems} items
                </div>
              </motion.div>

              {(bundle.items || []).length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {(bundle.items || []).map((item, index) => (
                    <Link
                      key={item.product?._id || index}
                      to={item.product ? `/products/${item.product._id}` : "#"}
                      className={`relative rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all aspect-[4/5] w-16 sm:w-20 hover:border-red-600 ${
                        index === 0 ? "border-red-600 ring-2 ring-red-600/20" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img src={buildImageUrl(item.product?.image)} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-1 right-1 bg-gray-900/70 text-white text-[9px] font-bold px-1 rounded">
                        ×{item.quantity || 1}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                    {bundle.name}
                  </h1>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3 py-2 border-y border-gray-100">
                  {bundle.store ? (
                    <Link
                      to={`/stores/${bundle.store.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-red-600 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shadow-sm text-xs">
                        {bundle.store.storeName?.charAt(0)}
                      </div>
                      <span>{bundle.store.storeName}</span>
                      <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs text-gray-400">
                      <FiPackage className="w-3.5 h-3.5" /> DiObral Marketplace
                    </span>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiPackage className="w-3.5 h-3.5 text-red-600" />
                    <span className="font-semibold">{bundle.items?.length || 0} products · {totalItems} items</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-gray-900 tracking-tight">${bundle.price?.toFixed(2)}</span>
                    {bundle.originalTotal > bundle.price && (
                      <span className="text-base text-gray-400 line-through font-medium">${bundle.originalTotal?.toFixed(2)}</span>
                    )}
                  </div>
                  {bundle.youSave > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                        <FiCheck className="w-3 h-3" /> You save ${bundle.youSave.toFixed(2)} ({bundle.youSavePercent}%)
                      </span>
                    </div>
                  )}
                </div>

                {typeof bundle.description === "string" && bundle.description.trim() && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">About this bundle</p>
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{bundle.description}</p>
                  </div>
                )}

                {(() => {
                  const tags = normalizeTags(bundle.tags)
                  if (!tags.length) return null
                  const shown = tags.slice(0, 8)
                  const extra = tags.length - shown.length
                  return (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {shown.map((tag) => (
                          <span key={tag} className="inline-flex items-center text-[10px] font-semibold text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {extra > 0 && (
                          <span className="inline-flex items-center text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            +{extra} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })()}

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bundle includes</p>
                  <div className="space-y-2.5">
                    {(bundle.items || []).map((item, index) => {
                      const product = item.product || {}
                      const unitPrice = product.price ?? 0
                      return (
                        <div key={product._id || index} className="flex items-center gap-3 bg-gray-50/60 border border-gray-100 rounded-xl p-2.5">
                          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100">
                            <img src={buildImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.name || "Product unavailable"}</p>
                            <p className="text-xs text-gray-400">Qty ×{item.quantity || 1}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-700 flex-shrink-0">${(unitPrice * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleAddToCart}
                    disabled={adding || outOfStock}
                    className={`w-full h-11 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                      added
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                    }`}
                  >
                    {adding ? (
                      <span className="flex items-center gap-2">Adding...<span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /></span>
                    ) : added ? (
                      <span className="flex items-center gap-2"><FiCheck className="w-4 h-4" /> Added to Cart</span>
                    ) : (
                      <span className="flex items-center gap-2"><FiShoppingBag className="w-4 h-4" /> Add Bundle to Cart</span>
                    )}
                  </motion.button>

                  <div className="flex items-center gap-2 text-xs">
                    {outOfStock ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-rose-600 font-semibold">One or more items are out of stock</span>
                      </>
                    ) : bundle.stock > 0 ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-700 font-semibold">{bundle.stock} bundles available in stock</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-700 font-semibold">In stock</span>
                      </>
                    )}
                  </div>

                  {bundle.maxPerOrder > 0 && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5" /> Limit of {bundle.maxPerOrder} per order
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <div className="grid grid-cols-3 gap-2">
                {guaranteeItems.map((item) => (
                  <div key={item.label} className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/60">
                    <item.icon className="w-4 h-4 text-red-600 mb-1" />
                    <p className="text-xs font-bold text-gray-800">{item.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {added && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold"
          >
            <FiCheck className="w-4 h-4 text-emerald-400" /> Bundle added to cart
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
