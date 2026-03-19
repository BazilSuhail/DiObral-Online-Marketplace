import { useState, useMemo } from "react"
import { motion } from "motion/react"
import {
  FiX, FiCheck, FiClock, FiTruck, FiPackage, FiCalendar,
  FiGift, FiArrowRight, FiBox, FiChevronDown, FiLoader,
} from "react-icons/fi"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuthStore, parseJwt } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import OrdersSkeleton from "../../components/loaders/OrdersSkeleton"
import Button from "../../components/ui/Button"
import { FaStore } from "react-icons/fa6"

const statusConfig = {
  pending: { icon: FiClock, bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  processing: { icon: FiPackage, bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", label: "Processing" },
  shipped: { icon: FiTruck, bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500", label: "Shipped" },
  delivered: { icon: FiCheck, bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Delivered" },
  cancelled: { icon: FiX, bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Cancelled" },
}

function StatusBadge({ status, size = "sm" }) {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.pending
  const s = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${cfg.bg} ${cfg.text} ${s}`}>
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
      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
            <cfg.icon className={`w-5 h-5 ${cfg.text}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">Order #{group.groupOrderId?.slice(0, 8)}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <FiCalendar className="w-3 h-3 flex-shrink-0" />
              {new Date(group.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right flex sm:block items-center gap-3 flex-shrink-0">
          <p className="font-bold text-gray-900">Rs. {group.total?.toFixed(2)}</p>
          <StatusBadge status={bestStatus} />
        </div>
      </div>

      <div className="p-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {group.orders?.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 min-w-0 w-full">
              <div className="flex -space-x-2 flex-shrink-0">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
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
              <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 group-hover:text-rose-500 transition-colors">
                Details <FiArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {group.totalSavings > 0 && (
        <div className="px-5 py-2.5 bg-green-50 border-t border-green-100 flex items-center gap-1.5 text-xs text-green-700">
          <FiGift className="w-3.5 h-3.5" /> You saved Rs. {group.totalSavings?.toFixed(2)} on this order
        </div>
      )}
    </motion.div>
  )
}

const statusFilters = [
  { key: "", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
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
    <main className="min-h-screen bg-slate-50/40 text-gray-800 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-400 mt-1">Track and manage your purchases</p>
        </motion.div>

        {justPlaced && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-600 text-white flex items-center justify-center flex-shrink-0">
              <FiCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">Order placed successfully!</p>
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
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              aria-label="Dismiss"
            >
              <FiX className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Order Groups" value={stats.total} icon={FiBox} color="text-gray-600" bg="bg-gray-100" />
          <StatCard label="Items" value={stats.totalItems} icon={FiPackage} color="text-blue-600" bg="bg-blue-100" />
          <StatCard label="Total Spent" value={`Rs. ${stats.totalSpent.toFixed(0)}`} icon={FiGift} color="text-green-600" bg="bg-green-100" />
          <StatCard label="Saved" value={`Rs. ${stats.totalSavings.toFixed(0)}`} icon={FiClock} color="text-amber-600" bg="bg-amber-100" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex items-center gap-3">
            {/* Filter buttons container with horizontal scroll on mobile */}
            <div className="bg-white border border-gray-100 rounded-xl p-1.5 inline-flex flex-nowrap gap-1 shadow-sm overflow-x-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {statusFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      filterStatus === f.key
                        ? "bg-red-700 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-400 mb-6">Start shopping to see your orders here.</p>
            <Link to="/productlist/all">
              <Button variant="red">Start Shopping <FiArrowRight className="ml-2 inline" /></Button>
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  )
}