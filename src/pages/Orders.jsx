import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  FiX, FiCheck, FiClock, FiTruck, FiPackage, FiCreditCard,
  FiCalendar, FiGift, FiArrowRight, FiEye,
} from "react-icons/fi"
import { Link } from "react-router-dom"
import { useMarketplaceStore } from "../lib/marketplaceStore"
import { useApiQuery } from "../api/adapter"
import Badge from "../utilities/Badge"
import OrdersSkeleton from "../Components/Loaders/OrdersSkeleton"
import { parseJwt } from "../lib/marketplaceStore"

const StatusIcon = ({ status }) => {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return <FiCheck className="w-5 h-5 text-green-600" />;
  if (s === "shipped") return <FiTruck className="w-5 h-5 text-blue-600" />;
  if (s === "processing") return <FiPackage className="w-5 h-5 text-yellow-600" />;
  return <FiClock className="w-5 h-5 text-red-500" />;
}

const OrderCard = ({ order, onViewDetails }) => {
  const totalSavings = order.items?.reduce((total, item) => {
    return total + ((item.price * item.quantity) - (item.discountedPrice * item.quantity));
  }, 0) || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-gray-200 to-gray-100 px-6 py-4 border-[2px] border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm"><StatusIcon status={order.status} /></div>
            <div>
              <h3 className="font-[600] text-gray-900 text-md">{order._id}</h3>
              <p className="text-sm font-[600] text-gray-500 flex items-center">
                <FiCalendar className="w-4 h-4 mr-1" />
                {new Date(order.orderDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 md:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Items ({order.items?.length || 0})</h4>
            <button onClick={() => onViewDetails(order)} className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"><FiEye className="w-4 h-4 mr-1" /> View Details</button>
          </div>
          <div className="flex flex-wrap space-y-3 space-x-3 overflow-x-auto pb-2">
            {order.items?.slice(0, 3).map((item) => (
              <div key={item._id} className="flex-shrink-0">
                <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.image}`} alt={item.name} width={80} height={80} className="rounded-lg object-cover border border-gray-200" />
              </div>
            ))}
            {(order.items?.length || 0) > 3 && (
              <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <span className="text-sm font-medium text-gray-600">+{order.items.length - 3}</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 border-[2px] border-gray-200 rounded-xl sm:px-4 px-3 py-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-bold text-xl text-gray-900">Rs. {order.total?.toFixed(2)}</span>
          </div>
          {totalSavings > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-green-600 text-sm flex items-center"><FiGift className="w-4 h-4 mr-1" /> You saved</span>
              <span className="font-semibold text-green-600">Rs. {totalSavings.toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 text-sm flex items-center"><FiGift className="w-4 h-4 mr-1" /> No savings</span>
              <span className="text-sm text-gray-400">Look out for deals!</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const totalSavings = order.items?.reduce((sum, item) => sum + ((item.price || 0) - (item.discountedPrice || 0)) * item.quantity, 0) || 0;
  const shipping = subtotal > 1000 ? 0 : 9.99;
  const tax = subtotal * 0.08;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-950 to-red-900 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-300 flex items-center mb-1">
                  <FiCalendar className="w-4 h-4 mr-2" /> Ordered on {new Date(order.orderDate).toLocaleDateString()}
                </h3>
                <div className="flex items-center space-x-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "delivered" ? "bg-green-600 text-white" :
                    order.status === "processing" ? "bg-yellow-600 text-white" :
                    order.status === "shipped" ? "bg-blue-600 text-white" :
                    "bg-gray-600 text-white"
                  }`}>
                    {(order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)}
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><FiX className="w-6 h-6" /></button>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] max-h-[calc(90vh-120px)]">
              <div className="p-6">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><FiPackage className="w-5 h-5 mr-2" /> Items ({totalItems})</h3>
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div key={item._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.image}`} alt={item.name} width={80} height={80} className="rounded-lg object-cover border border-gray-200" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <div className="mt-1 text-sm text-gray-600">Size: {item.size}</div>
                          <div className="mt-1 text-sm text-gray-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">Rs. {item.price?.toFixed(2)}</div>
                          {item.discountedPrice < item.price && (
                            <div className="text-sm text-gray-500 text-center line-through">Rs. {item.discountedPrice?.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><FiCreditCard className="w-5 h-5 mr-2" /> Order Summary</h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">Rs. {subtotal.toFixed(2)}</span></div>
                        {totalSavings > 0 && <div className="flex justify-between text-green-600"><span>Savings</span><span className="font-medium">-Rs. {totalSavings.toFixed(2)}</span></div>}
                        <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="font-medium">{shipping === 0 ? "Free" : `Rs. ${shipping.toFixed(2)}`}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Tax</span><span className="font-medium">Rs. {tax.toFixed(2)}</span></div>
                        <div className="border-t border-gray-300 pt-3">
                          <div className="flex justify-between"><span className="text-lg font-bold text-gray-900">Total</span><span className="text-lg font-bold text-gray-900">Rs. {order.total?.toFixed(2)}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Orders() {
  const token = useMarketplaceStore((s) => s.token);
  const decoded = parseJwt(token);
  const userId = decoded?.id;

  const { data: userorders, isLoading } = useApiQuery(`/place-order/orders/${userId}`, null, { enabled: !!userId });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }

  const activeOrders = userorders?.activeOrders || [];
  const completedOrders = userorders?.completedOrders || [];

  if (isLoading) return <OrdersSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-b bg-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-red-900 mb-2">My <span className="text-red-600">Orders</span></h1>
          <p className="text-red-700 font-[600]">Track and manage your order history</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Total Orders</p><p className="text-2xl font-bold text-gray-900">{activeOrders.length + completedOrders.length}</p></div>
              <div className="p-3 bg-gray-100 rounded-lg"><FiPackage className="w-6 h-6 text-gray-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Delivered</p><p className="text-2xl font-bold text-green-600">{completedOrders.length}</p></div>
              <div className="p-3 bg-green-100 rounded-lg"><FiCheck className="w-6 h-6 text-green-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Processing</p><p className="text-2xl font-bold text-yellow-600">{activeOrders.length}</p></div>
              <div className="p-3 bg-yellow-100 rounded-lg"><FiClock className="w-6 h-6 text-yellow-600" /></div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 inline-flex">
            {[
              { key: "all", label: "All Orders" },
              { key: "active", label: "Processing" },
              { key: "completed", label: "Delivered" },
            ].map((filter) => (
              <button key={filter.key} onClick={() => setFilterStatus(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === filter.key ? "bg-red-800 text-white shadow-md" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {filterStatus === "active" && (activeOrders.length > 0 ? activeOrders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <OrderCard order={order} onViewDetails={handleViewDetails} />
            </motion.div>
          )) : <p className="text-gray-500">No orders found.</p>)}

          {filterStatus === "completed" && (completedOrders.length > 0 ? completedOrders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <OrderCard order={order} onViewDetails={handleViewDetails} />
            </motion.div>
          )) : <p className="text-gray-500">No orders found.</p>)}

          {filterStatus === "all" && <>
            {activeOrders.map((order, i) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <OrderCard order={order} onViewDetails={handleViewDetails} />
              </motion.div>
            ))}
            {completedOrders.map((order, i) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + activeOrders.length) }}>
                <OrderCard order={order} onViewDetails={handleViewDetails} />
              </motion.div>
            ))}
          </>}
        </motion.div>

        {(completedOrders.length === 0 && activeOrders.length === 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
            <Link to="/productlist/All" className="inline-flex items-center px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg transition-colors">
              Start Shopping <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </div>

      <OrderDetailsModal order={selectedOrder} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
