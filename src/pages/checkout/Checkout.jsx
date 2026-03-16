import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"
import { post, apiCall } from "../../api/client"
import { motion } from "motion/react"
import { Link } from "react-router-dom"
import {
  FiCheck, FiMapPin, FiUser, FiShoppingBag, FiArrowRight,
  FiTag, FiMessageSquare, FiPhone, FiHome, FiGlobe,
  FiLoader,
} from "react-icons/fi"
import Button from "../../utilities/Button"

const CartItem = ({ item, index }) => {
  const product = item.product
  if (!product) return null
  const price = item.price
  const originalPrice = product.price
  const isDiscounted = price < originalPrice

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
    >
      <img
        src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${product.image}`}
        alt={product.name}
        className="rounded-lg border border-gray-200 w-14 h-14 object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-400">Size: {item.size} &middot; Qty: {item.quantity}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">Rs. {price.toFixed(2)}</p>
        {isDiscounted && <p className="text-[10px] text-gray-400 line-through">Rs. {originalPrice.toFixed(2)}</p>}
      </div>
    </motion.div>
  )
}

export default function Checkout() {
  const cart = useCartStore((s) => s.cart)
  const clearCart = useCartStore((s) => s.clearCart)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    notes: "",
    couponCode: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = useAuthStore.getState().token
        if (!token) { navigate("/signin"); return }
        const res = await apiCall("/auth/profile", "GET")
        setForm((f) => ({
          ...f,
          fullName: res.fullName || "",
          email: res.email || "",
          phone: res.contact || "",
          street: res.address?.street || "",
          city: res.address?.city || "",
          state: res.address?.state || "",
          country: res.address?.country || "",
        }))
      } catch {
        navigate("/signin")
      }
    }
    fetchProfile()
  }, [navigate])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const subtotal = cart.reduce((t, i) => t + (i.product?.price || 0) * i.quantity, 0)
  const discount = subtotal - cart.reduce((t, i) => t + (i.price || 0) * i.quantity, 0)
  const shipping = 200
  const total = subtotal - discount + shipping

  const handlePlaceOrder = async () => {
    if (!form.street || !form.city || !form.state || !form.country || !form.phone) {
      alert("Please fill in all required shipping fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await post("/checkout", {
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
        },
        contactPhone: form.phone,
        notes: form.notes || undefined,
        couponCode: form.couponCode || undefined,
      })
      alert(res.message || "Order placed!")
      clearCart()
      navigate(`/orders-tracking`)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to place order")
    } finally {
      setSubmitting(false)
    }
  }

  if (!cart.length) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some items before checking out.</p>
          <Link to="/productlist/All">
            <Button variant="red">Continue Shopping <FiArrowRight className="ml-2 inline" /></Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Review your order and complete purchase</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left — Form */}
          <div className="flex-1 space-y-6">
            {/* Contact */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FiUser className="w-5 h-5 text-rose-500" /> Contact
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                <Input label="Phone *" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+92 300 1234567" className="sm:col-span-2" icon={FiPhone} />
              </div>
            </motion.div>

            {/* Shipping */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FiMapPin className="w-5 h-5 text-rose-500" /> Shipping Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Street Address *" value={form.street} onChange={(e) => set("street", e.target.value)} icon={FiHome} className="sm:col-span-2" />
                <Input label="City *" value={form.city} onChange={(e) => set("city", e.target.value)} />
                <Input label="State *" value={form.state} onChange={(e) => set("state", e.target.value)} />
                <Input label="Country *" value={form.country} onChange={(e) => set("country", e.target.value)} icon={FiGlobe} className="sm:col-span-2" />
              </div>
            </motion.div>

            {/* Extras */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><FiTag className="w-4 h-4 text-rose-500" /> Coupon Code</label>
                  <input
                    value={form.couponCode}
                    onChange={(e) => set("couponCode", e.target.value.toUpperCase())}
                    placeholder="SAVE20"
                    className="w-full h-11 rounded-xl border-2 border-gray-200 bg-white px-4 text-sm focus:outline-none focus:border-rose-400 transition-colors uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><FiMessageSquare className="w-4 h-4 text-rose-500" /> Notes</label>
                  <input
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Leave at door, etc."
                    className="w-full h-11 rounded-xl border-2 border-gray-200 bg-white px-4 text-sm focus:outline-none focus:border-rose-400 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — Summary */}
          <div className="w-full lg:w-[420px] flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24"
            >
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FiShoppingBag className="w-5 h-5 text-rose-500" /> Order Summary
              </h2>

              <div className="max-h-64 overflow-y-auto mb-4 -mx-1 px-1">
                {cart.map((item, i) => (
                  <CartItem key={`${item.product?._id}-${item.size}`} item={item} index={i} />
                ))}
              </div>

              <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>-Rs. {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Rs. {shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2.5 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full mt-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <><FiLoader className="w-5 h-5 animate-spin" /> Placing Order...</>
                ) : (
                  <><FiCheck className="w-5 h-5" /> Place Order</>
                )}
              </button>

              <Link to="/cart">
                <button className="w-full mt-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors">
                  Back to Cart
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}

function Input({ label, icon: Icon, className = "", ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input
          className={`w-full h-11 rounded-xl border-2 border-gray-200 bg-white ${Icon ? "pl-10" : "px-4"} text-sm focus:outline-none focus:border-rose-400 transition-colors`}
          {...props}
        />
      </div>
    </div>
  )
}
