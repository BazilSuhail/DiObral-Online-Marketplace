import { useParams, Link } from "react-router-dom"
import { motion } from "motion/react"
import { useApiQuery } from "../../api/adapter"
import {
  FiArrowLeft, FiCheck, FiClock, FiTruck, FiPackage, FiX,
  FiMapPin, FiPhone, FiMessageSquare, FiCalendar, FiGift,
  FiBox, FiCreditCard,
} from "react-icons/fi"
import { NotFound } from "../../components/illustrations"
import { FaStore } from "react-icons/fa6"

const steps = ["pending", "processing", "shipped", "delivered"]

const statusConfig = {
  pending: { icon: FiClock, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-300", label: "Pending" },
  processing: { icon: FiPackage, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-300", label: "Processing" },
  shipped: { icon: FiTruck, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-300", label: "Shipped" },
  delivered: { icon: FiCheck, color: "text-green-600", bg: "bg-green-100", border: "border-green-300", label: "Delivered" },
  cancelled: { icon: FiX, color: "text-red-600", bg: "bg-red-100", border: "border-red-300", label: "Cancelled" },
}

export default function OrderDetail() {
  const { id } = useParams()

  const { data: order, isLoading } = useApiQuery(`/orders/${id}`, null, { enabled: !!id })

  if (isLoading) {
    return (
      <main className="soft-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="h-5 soft-skeleton rounded w-32 mb-6" />
          <div className="soft-card rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl soft-skeleton" />
              <div className="space-y-2">
                <div className="h-5 soft-skeleton rounded w-28" />
                <div className="h-3 soft-skeleton rounded w-40" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full soft-skeleton" />
                  {i < 4 && <div className="flex-1 h-1 soft-skeleton rounded" />}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="soft-card rounded-3xl p-6 space-y-4">
                <div className="h-5 soft-skeleton rounded w-24" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl soft-skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 soft-skeleton rounded w-3/4" />
                      <div className="h-3 soft-skeleton rounded w-1/3" />
                    </div>
                    <div className="h-4 soft-skeleton rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="soft-card rounded-3xl p-6 space-y-3">
                <div className="h-5 soft-skeleton rounded w-20" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 soft-skeleton rounded w-16" />
                    <div className="h-3 soft-skeleton rounded w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="soft-page flex items-center justify-center px-4">
        <div className="soft-card mx-auto max-w-lg px-6 py-12 flex flex-col items-center text-center rounded-3xl">
          <NotFound size={200} className="mb-6" />
          <h3 className="text-xl font-semibold text-gray-900">Order not found</h3>
          <p className="mt-2 text-sm text-gray-500">We could not find the order you are looking for.</p>
          <Link to="/orders-tracking" className="soft-btn soft-btn-primary mt-6"><FiArrowLeft className="h-4 w-4" />Back to orders</Link>
        </div>
      </main>
    )
  }

  const cfg = statusConfig[order.status?.toLowerCase()] || statusConfig.pending
  const currentStep = steps.indexOf(order.status?.toLowerCase())
  const itemsCount = order.items?.reduce((s, _i) => s + _i.quantity, 0) || 0
  const shippingFree = (order.subtotal || 0) - (order.discount || 0) >= 2000

  return (
    <main className="soft-page text-gray-800 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-hidden">
          <Link to="/orders-tracking" className="hover:text-red-600 transition-colors flex items-center gap-1 shrink-0">
            <FiArrowLeft className="w-3.5 h-3.5" /> Orders
          </Link>
          <span className="shrink-0">/</span>
          <span className="text-gray-700 font-medium truncate min-w-0">#{order._id?.slice(0, 8)}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="soft-card rounded-3xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                <cfg.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${cfg.color}`} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{cfg.label}</h1>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <FiCalendar className="w-3 h-3 shrink-0" />
                  <span className="truncate">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </p>
              </div>
            </div>
            {order.trackingNumber && (
              <div className="text-xs soft-card-inset rounded-xl px-3 py-1.5 shrink-0">
                <span className="text-gray-400">Tracking:</span>{" "}
                <span className="font-mono font-medium text-gray-700">{order.trackingNumber}</span>
              </div>
            )}
          </div>

          <div className="mt-5 sm:mt-6 flex items-center w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {steps.map((s, i) => {
              const scfg = statusConfig[s]
              const isActive = i <= currentStep
              const isCancelled = order.status?.toLowerCase() === "cancelled"
              const isLast = i === steps.length - 1
              return (
                <div key={s} className={`flex items-center ${isLast ? '' : 'flex-1 min-w-0'}`}>
                  <div className="flex flex-col items-center">
                    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shrink-0 shadow-soft-xs ${
                      isCancelled && i > 0 ? "bg-gray-100" :
                      isActive ? `${scfg.bg} ${scfg.color} ring-2 ring-white` : "bg-gray-100 text-gray-300"
                    }`}>
                      <scfg.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </motion.div>
                    <span className={`text-[9px] sm:text-[10px] mt-1 font-medium whitespace-nowrap tracking-tight ${
                      isActive && !isCancelled ? scfg.color : "text-gray-400"
                    }`}>
                      {scfg.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className="flex-1 h-1 mx-1.5 sm:mx-2 rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: !(isCancelled && i >= currentStep - 1) && i < currentStep ? "100%" : "0%" }}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                        className="h-full rounded-full bg-red-500"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {order.status?.toLowerCase() === "cancelled" && (
            <div className="mt-3 text-xs text-red-600 bg-red-50 ring-1 ring-red-100 rounded-2xl px-3 py-2 text-center">
              This order was cancelled
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="soft-card rounded-3xl p-5 sm:p-6">
              <h2 className="soft-section-title text-lg font-semibold text-gray-900 mb-4">
                <span className="soft-icon-tile soft-icon-tile-sm"><FiBox className="h-4 w-4" /></span> Items ({itemsCount})
              </h2>
              <div className="divide-y divide-gray-100">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ring-1 ring-gray-200/60 bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.image}`} alt={item.name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <FiBox className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name || "Item"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.size && <>Size: {item.size} &middot; </>}
                        Qty: {item.quantity || 0}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">Rs. {(item.discountedPrice || item.price || 0).toFixed(2)}</p>
                      {item.discountedPrice != null && item.price != null && item.discountedPrice < item.price && (
                        <p className="text-[10px] text-gray-400 line-through">Rs. {item.price.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="soft-card rounded-3xl p-5 sm:p-6">
              <h2 className="soft-section-title text-lg font-semibold text-gray-900 mb-4">
                <span className="soft-icon-tile soft-icon-tile-sm"><FaStore className="h-4 w-4" /></span> Store
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-100 ring-1 ring-gray-200/60 flex items-center justify-center shrink-0">
                  <FaStore className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{order.store?.storeName || "Unknown Store"}</p>
                  {order.store?.contactEmail && <p className="text-xs text-gray-400 truncate">{order.store.contactEmail}</p>}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="soft-card rounded-3xl p-5 sm:p-6">
              <h2 className="soft-section-title text-lg font-semibold text-gray-900 mb-4">
                <span className="soft-icon-tile soft-icon-tile-sm"><FiCreditCard className="h-4 w-4" /></span> Summary
              </h2>
              <div className="space-y-2.5 text-sm">
                <Row label="Subtotal" value={`Rs. ${(order.subtotal || 0).toFixed(2)}`} />
                {order.discount > 0 && <Row label="Discount" value={`-Rs. ${(order.discount || 0).toFixed(2)}`} className="text-green-700" />}
                <Row label="Shipping" value={shippingFree ? "Free" : "Rs. 200.00"} />
                <div className="soft-divider mb-2.5" />
                <div>
                  <Row label="Total" value={`Rs. ${(order.total || 0).toFixed(2)}`} bold />
                </div>
                {(order.totalSavings || 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-xs soft-badge soft-badge-success rounded-2xl px-3 py-2 mt-2">
                    <FiGift className="w-3.5 h-3.5 shrink-0" /> You saved Rs. {(order.totalSavings || 0).toFixed(2)}
                  </div>
                )}
              </div>
            </motion.div>

            {order.shippingAddress && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="soft-card rounded-3xl p-5 sm:p-6">
                <h2 className="soft-section-title text-lg font-semibold text-gray-900 mb-4">
                  <span className="soft-icon-tile soft-icon-tile-sm"><FiMapPin className="h-4 w-4" /></span> Shipping
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="break-words">{order.shippingAddress.street}</p>
                  <p className="break-words">{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}</p>
                  <p className="break-words">{order.shippingAddress.country}</p>
                </div>
                {order.contactPhone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                    <FiPhone className="w-3 h-3 shrink-0" /> {order.contactPhone}
                  </p>
                )}
                {order.notes && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-2 break-words">
                    <FiMessageSquare className="w-3 h-3 shrink-0" /> {order.notes}
                  </p>
                )}
              </motion.div>
            )}

            {order.trackingNumber && (
              <div className="soft-card-inset rounded-3xl p-5 text-center ring-1 ring-gray-200/60">
                <span className="soft-icon-tile soft-icon-tile-lg mx-auto mb-2"><FiTruck className="w-6 h-6" /></span>
                <p className="text-sm font-semibold text-gray-900 mb-1">Tracking Available</p>
                <p className="text-xs text-red-600 font-mono break-all">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value, bold, className = "" }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-gray-900" : "text-gray-600"} ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}