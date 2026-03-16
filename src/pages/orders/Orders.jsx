import { useState, useMemo } from "react"
import { motion } from "motion/react"
import {
  FiX, FiCheck, FiClock, FiTruck, FiPackage, FiCalendar,
  FiGift, FiArrowRight, FiBox,
} from "react-icons/fi"
import { Link } from "react-router-dom"
import { useAuthStore, parseJwt } from "../../store/authStore"
import { useApiQuery } from "../../api/adapter"
import OrdersSkeleton from "../../components/loaders/OrdersSkeleton"
import Button from "../../utilities/Button"
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
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Group header */}
      <div className={`px-5 py-3.5 flex items-center justify-between border-b border-gray-100`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}>
            <cfg.icon className={`w-5 h-5 ${cfg.text}`} />
          </div>
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {new Date(group.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
            <p className="text-[10px] text-gray-400 font-mono">#{group.groupOrderId?.slice(0, 8)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">Rs. {group.total?.toFixed(2)}</p>
          <StatusBadge status={bestStatus} />
        </div>
      </div>

      {/* Sub-orders per store */}
      <div className="divide-y divide-gray-50">
        {group.orders?.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <FaStore className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{order.store?.storeName || "Store"}</p>
              <p className="text-xs text-gray-400">{order.items?.length || 0} items &middot; Rs. {order.total?.toFixed(2)}</p>
            </div>
            <div className="flex -space-x-1.5">
              {order.items?.slice(0, 3).map((item, i) => (
                <div key={i} className="w-7 h-7 rounded-md border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.image}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FiBox className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
            <FiArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Group summary */}
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

  const [filterStatus, setFilterStatus] = useState("")

  const { data, isLoading } = useApiQuery("/orders", { status: filterStatus || undefined }, { enabled: !!userId })

  const groups = data?.orders || []

  const stats = useMemo(() => {
    const all = groups
    return {
      total: all.length,
      totalItems: all.reduce((s, g) => s + g.orders?.reduce((ss, o) => ss + (o.items?.length || 0), 0) || 0, 0),
      totalSpent: all.reduce((s, g) => s + (g.total || 0), 0),
      totalSavings: all.reduce((s, g) => s + (g.totalSavings || 0), 0),
    }
  }, [groups])

  if (isLoading) return <OrdersSkeleton />
  const hasOrders = groups.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage your purchases</p>
        </motion.div>

        {/* Stats */}
        {hasOrders && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Order Groups" value={stats.total} icon={FiBox} color="text-gray-600" bg="bg-gray-100" />
            <StatCard label="Items" value={stats.totalItems} icon={FiPackage} color="text-blue-600" bg="bg-blue-100" />
            <StatCard label="Total Spent" value={`Rs. ${stats.totalSpent.toFixed(0)}`} icon={FiGift} color="text-green-600" bg="bg-green-100" />
            <StatCard label="Saved" value={`Rs. ${stats.totalSavings.toFixed(0)}`} icon={FiClock} color="text-amber-600" bg="bg-amber-100" />
          </motion.div>
        )}

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 overflow-x-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-1.5 inline-flex gap-1">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filterStatus === f.key
                      ? "bg-red-700 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Orders list */}
        {hasOrders ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="space-y-5">
            {groups.map((group) => (
              <OrderGroupCard key={group.groupOrderId} group={group} />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-400 mb-6">Start shopping to see your orders here.</p>
            <Link to="/productlist/All">
              <Button variant="red">Start Shopping <FiArrowRight className="ml-2 inline" /></Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className={`text-xl font-bold text-gray-900 mt-0.5`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  )
}
