import { useState, useMemo } from "react"
import { motion } from "motion/react"
import {
  FiX, FiClock, FiTruck, FiPackage, FiCalendar, FiCheckCircle, FiXCircle, FiRefreshCw,
  FiGift, FiArrowRight, FiBox, FiLoader, FiShoppingBag, FiTag, FiList, FiDollarSign,
} from "react-icons/fi"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuthStore, parseJwt } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import OrdersSkeleton from "../../components/loaders/OrdersSkeleton"
import { NoOrders, OrderSuccess } from "../../components/illustrations"
import { FaStore } from "react-icons/fa6"

const statusConfig = {
  pending: { icon: FiClock, bg: "bg-red-50", text: "text-red-600", badge: "soft-badge-warning", label: "Pending" },
  processing: { icon: FiRefreshCw, bg: "bg-red-50", text: "text-red-600", badge: "soft-badge-neutral", label: "Processing" },
  shipped: { icon: FiTruck, bg: "bg-red-50", text: "text-red-600", badge: "soft-badge-neutral", label: "Shipped" },
  delivered: { icon: FiCheckCircle, bg: "bg-red-50", text: "text-red-600", badge: "soft-badge-success", label: "Delivered" },
  cancelled: { icon: FiXCircle, bg: "bg-red-50", text: "text-red-600", badge: "soft-badge-danger", label: "Cancelled" },
}

function StatusBadge({ status, size = "sm" }) {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.pending
  const s = size === "sm" ? "" : "text-xs"
  return (
    <span className={`soft-badge ${cfg.badge} ${s}`}>
      <cfg.icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {cfg.label}
    </span>
  )
}

function OrderGroupCard({ group }) {
  const bestStatus = group.status || "pending"
  const cfg = statusConfig[bestStatus?.toLowerCase()] || statusConfig.pending

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="soft-card rounded-3xl overflow-hidden"
    >
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/60 bg-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="soft-icon-tile flex-shrink-0">
            <cfg.icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Order #{group.groupOrderId?.slice(0, 8)}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <FiCalendar className="w-3 h-3 flex-shrink-0" />
              {new Date(group.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right flex sm:block items-center gap-3 flex-shrink-0">
          <p className="font-semibold text-gray-900">Rs. {group.total?.toFixed(2)}</p>
          <StatusBadge status={bestStatus} />
        </div>
      </div>

      <div className="p-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {group.orders?.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-gray-100 ring-1 ring-gray-200/60 hover:bg-white hover:shadow-soft transition-all"
          >
            <div className="flex items-center gap-3 min-w-0 w-full">
              <div className="flex -space-x-2 flex-shrink-0">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl ring-2 ring-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-soft-xs">
                    {item.image ? (
                      <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.image}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FiBox className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                  <FaStore className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{order.store?.storeName || "Store"}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {order.items?.length || 0} items &middot; Rs. {order.total?.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:gap-1.5 flex-shrink-0 w-full sm:w-auto">
              <StatusBadge status={order.status} size="sm" />
              <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 group-hover:text-red-600 transition-colors">
                Details <FiArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {group.totalSavings > 0 && (
        <div className="px-5 py-2.5 bg-gray-100 border-t border-gray-200/60 flex items-center gap-1.5 text-xs text-green-700">
          <FiGift className="w-3.5 h-3.5" /> You saved Rs. {group.totalSavings?.toFixed(2)} on this order
        </div>
      )}
    </motion.div>
  )
}

const statusFilters = [
  { key: "", label: "All Orders", icon: FiList },
  { key: "pending", label: "Pending", icon: FiClock },
  { key: "processing", label: "Processing", icon: FiRefreshCw },
  { key: "shipped", label: "Shipped", icon: FiTruck },
  { key: "delivered", label: "Delivered", icon: FiCheckCircle },
]

export default function Orders() {
  const token = useAuthStore((s) => s.token)
  const decoded = parseJwt(token)
  const userId = decoded?.id

  const location = useLocation()
  const navigate = useNavigate()
  const justPlaced = location.state?.justPlaced

  const [filterStatus, setFilterStatus] = useState("")

  const { data, isLoading, isFetching } = useApiQuery(
    "/orders",
    { status: filterStatus || undefined },
    { enabled: !!userId, placeholderData: (prev) => prev },
  )

  const groups = data?.orders || []
  const firstLoad = isLoading && !data

  const stats = useMemo(() => {
    const all = groups
    return {
      total: all.length,
      totalItems: all.reduce((s, g) => s + g.orders?.reduce((ss, o) => ss + (o.items?.length || 0), 0) || 0, 0),
      totalSpent: all.reduce((s, g) => s + (g.total || 0), 0),
      totalSavings: all.reduce((s, g) => s + (g.totalSavings || 0), 0),
    }
  }, [groups])

  if (firstLoad) return <OrdersSkeleton />

  const hasOrders = groups.length > 0

  return (
    <main className="soft-page text-gray-800 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="soft-section-title text-3xl font-semibold text-gray-900"><span className="soft-icon-tile"><FiPackage className="h-5 w-5" /></span>My Orders</h1>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5"><FiTruck className="h-4 w-4 text-red-500" />Track and manage your purchases</p>
        </motion.div>

        {justPlaced && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="soft-card rounded-3xl mb-8 p-5 flex items-start gap-4">
            <OrderSuccess size={72} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">Order placed successfully!</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Thank you for your order
                {justPlaced.count > 0 && <> &mdash; {justPlaced.count} package{justPlaced.count > 1 ? "s" : ""} </>}
                totaling <span className="font-semibold text-gray-900">Rs. {justPlaced.total?.toFixed(2)}</span>
                {justPlaced.groupOrderId && <> (reference <span className="font-mono font-medium text-gray-900">#{justPlaced.groupOrderId.slice(0, 8)}</span>)</>}.
                Track it below.
              </p>
            </div>
            <button
              onClick={() => navigate("/orders-tracking", { replace: true, state: null })}
              className="soft-icon-btn flex-shrink-0"
              aria-label="Dismiss"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Order Groups" value={stats.total} icon={FiBox} />
          <StatCard label="Items" value={stats.totalItems} icon={FiPackage} />
          <StatCard label="Total Spent" value={`Rs. ${stats.totalSpent.toFixed(0)}`} icon={FiDollarSign} />
          <StatCard label="Saved" value={`Rs. ${stats.totalSavings.toFixed(0)}`} icon={FiTag} />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex items-center gap-3">
            {/* Filter buttons container with horizontal scroll on mobile */}
            <div className="soft-card rounded-2xl p-1.5 inline-flex flex-nowrap gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {statusFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`soft-chip flex-shrink-0 whitespace-nowrap ${filterStatus === f.key ? "soft-chip-active" : ""}`}
                >
                  <f.icon className="h-3.5 w-3.5" />
                  {f.label}
                </button>
              ))}
            </div>
            {isFetching && !firstLoad && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                <FiLoader className="w-3.5 h-3.5 animate-spin" /> Updating...
              </div>
            )}
          </div>
        </motion.div>

        {hasOrders ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid gap-5 md:grid-cols-2"
          >
            {groups.map((group) => (
              <OrderGroupCard key={group.groupOrderId} group={group} />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="soft-card mx-auto max-w-lg px-6 py-12 flex flex-col items-center text-center">
            <NoOrders size={200} className="mb-6" />
            <h3 className="text-xl font-semibold text-gray-900">No orders yet</h3>
            <p className="mt-2 text-sm text-gray-500">Start shopping to see your orders here.</p>
            <Link to="/productlist/all" className="soft-btn soft-btn-primary mt-6"><FiShoppingBag className="h-4 w-4" />Start shopping<FiArrowRight className="h-4 w-4" /></Link>
          </motion.div>
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="soft-card rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-semibold text-gray-900 mt-0.5">{value}</p>
        </div>
        <span className="soft-icon-tile">
          <Icon className="w-5 h-5" />
        </span>
      </div>
    </motion.div>
  )
}