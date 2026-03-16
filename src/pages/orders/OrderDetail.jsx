import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "motion/react"
import { useApiQuery } from "../../api/adapter"
import {
  FiArrowLeft, FiCheck, FiClock, FiTruck, FiPackage, FiX,
  FiMapPin, FiPhone, FiMessageSquare, FiCalendar, FiGift,
  FiTag, FiBox,
} from "react-icons/fi"
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
  const navigate = useNavigate()

  const { data: order, isLoading } = useApiQuery(`/orders/${id}`, null, { enabled: !!id })
  const { data: tracking } = useApiQuery(`/orders/${id}/track`, null, { enabled: !!id })

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-32 bg-gray-100 rounded-2xl" />
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Order not found</p>
          <Link to="/orders-tracking" className="text-rose-600 text-sm mt-2 inline-block">Back to orders</Link>
        </div>
      </main>
    )
  }

  const cfg = statusConfig[order.status?.toLowerCase()] || statusConfig.pending
  const currentStep = steps.indexOf(order.status?.toLowerCase())
  const itemsCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/orders-tracking" className="hover:text-rose-600 transition-colors flex items-center gap-1">
            <FiArrowLeft className="w-3.5 h-3.5" /> Orders
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">#{order._id?.slice(0, 8)}</span>
        </motion.div>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                <cfg.icon className={`w-7 h-7 ${cfg.color}`} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{cfg.label}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
              <p className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                <FiCalendar className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              {order.trackingNumber && (
                <div className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 whitespace-nowrap">
                  <span className="text-gray-400">Tracking:</span>{" "}
                  <span className="font-mono font-medium text-gray-700">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status timeline */}
          <div className="mt-6 flex items-center w-full">
            {steps.map((s, i) => {
              const scfg = statusConfig[s]
              const isActive = i <= currentStep
              const isCancelled = order.status?.toLowerCase() === "cancelled"
              return (
                <div key={s} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCancelled && i > 0 ? "bg-gray-100" :
                      isActive ? `${scfg.bg} ${scfg.color} border-2 ${scfg.border}` : "bg-gray-100 text-gray-300 border-2 border-gray-200"
                    }`}>
                      <scfg.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${isActive && !isCancelled ? scfg.color : "text-gray-400"}`}>{scfg.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-[-18px] ${isCancelled && i >= currentStep - 1 ? "bg-gray-200" : i < currentStep ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              )
            })}
          </div>
          {order.status?.toLowerCase() === "cancelled" && (
            <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              This order was cancelled
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Items */}
          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FiBox className="w-5 h-5 text-rose-500" /> Items ({itemsCount})
              </h2>
              <div className="divide-y divide-gray-100">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiBox className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Size: {item.size} &middot; Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">Rs. {(item.discountedPrice || item.price).toFixed(2)}</p>
                      {item.discountedPrice < item.price && (
                        <p className="text-[10px] text-gray-400 line-through">Rs. {item.price.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Store info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FaStore className="w-5 h-5 text-rose-500" /> Store
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <FaStore className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.store?.storeName || "Unknown Store"}</p>
                  {order.store?.contactEmail && <p className="text-xs text-gray-400">{order.store.contactEmail}</p>}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FiTag className="w-5 h-5 text-rose-500" /> Summary
              </h2>
              <div className="space-y-2.5 text-sm">
                <Row label="Subtotal" value={`Rs. ${order.subtotal?.toFixed(2)}`} />
                {order.discount > 0 && <Row label="Discount" value={`-Rs. ${order.discount?.toFixed(2)}`} className="text-green-700" />}
                <Row label="Shipping" value="Rs. 200.00" />
                <div className="border-t border-gray-100 pt-2.5">
                  <Row label="Total" value={`Rs. ${order.total?.toFixed(2)}`} bold />
                </div>
                {order.totalSavings > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
                    <FiGift className="w-3.5 h-3.5" /> You saved Rs. {order.totalSavings?.toFixed(2)}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Shipping */}
            {order.shippingAddress && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FiMapPin className="w-5 h-5 text-rose-500" /> Shipping
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
                {order.contactPhone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                    <FiPhone className="w-3 h-3" /> {order.contactPhone}
                  </p>
                )}
                {order.notes && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                    <FiMessageSquare className="w-3 h-3" /> {order.notes}
                  </p>
                )}
              </motion.div>
            )}

            {/* Track Order button */}
            {order.trackingNumber && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-center">
                <FiTruck className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-indigo-800 mb-1">Tracking Available</p>
                <p className="text-xs text-indigo-600 font-mono">{order.trackingNumber}</p>
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
    <div className={`flex justify-between ${bold ? "font-bold text-gray-900" : "text-gray-600"} ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
