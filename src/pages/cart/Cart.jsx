import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useCartStore } from "../../store/cartStore"
import { useAuthStore } from "../../store/authStore"
import {
  FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight, FiCheck, FiShoppingCart, FiTag,
  FiTruck, FiPercent, FiCreditCard, FiSave, FiLock, FiLogIn, FiPackage, FiAlertCircle, FiLayers,
} from "react-icons/fi"
import { Link } from "react-router-dom"
import { EmptyCart, SignInRequired } from "../../components/illustrations"
import { getCartItemPrice } from "../../lib/utils"

const Separator = ({ className = "" }) => <div className={`soft-divider ${className}`} />

const CartItem = ({ item, onIncrease, onDecrease, onRemove, index }) => {
  const reduce = useReducedMotion();
  const isBundle = item.itemType === "bundle";
  const product = item.product;
  const name = isBundle ? (item.bundleName || item.bundle?.name || "Bundle") : product?.name;
  const image = isBundle ? (item.image || item.bundle?.image) : product?.image;
  if (!name) return null;

  const { originalPrice, effectivePrice, hasSale, discountPct } = getCartItemPrice(item);
  const price = effectivePrice;
  const savings = hasSale ? ((originalPrice - price) * item.quantity).toFixed(2) : 0;
  const key = isBundle ? item._id : product._id;
  const imageSrc = image ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${image}` : "/placeholder.png";

  return (
    <motion.div
      layout={!reduce}
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: reduce ? 0 : -30 }}
      transition={{ duration: 0.4, delay: reduce ? 0 : index * 0.08 }}
      className="soft-card soft-card-hover rounded-3xl p-4 md:p-6"
    >
      <div className="flex gap-4 md:gap-6">
        <div className="relative flex-shrink-0">
          <img
            src={imageSrc}
            alt={name}
            className="rounded-2xl ring-1 ring-gray-200/60 shadow-soft-sm w-[110px] h-[110px] md:w-[140px] md:h-[140px] object-cover"
          />
          {hasSale && (
            <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] md:text-xs font-semibold px-2 py-1 rounded-tl-2xl rounded-br-2xl shadow-soft-red inline-flex items-center gap-1">
              <FiPercent className="w-3 h-3" />{discountPct}% OFF
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm text-gray-700 ring-1 ring-gray-200/60 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            x{item.quantity}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-snug truncate">{name}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-400">
                {isBundle ? (
                  <span className="soft-badge soft-badge-sale"><FiLayers className="w-3 h-3" />Bundle Deal</span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1"><FiTag className="w-3 h-3" />Size: <span className="font-medium text-gray-600">{item.size}</span></span>
                    <span className="inline-flex items-center gap-1"><FiPackage className="w-3 h-3" />Stock: <span className={`font-medium ${product.stock > 5 ? "text-green-600" : "text-amber-600"}`}>{product.stock > 5 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out"}</span></span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(key, isBundle ? null : item.size)}
              aria-label="Remove item"
              className="soft-icon-btn text-gray-400 hover:text-red-600 flex-shrink-0"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-auto pt-3 md:pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="soft-card-inset rounded-2xl p-1 flex items-center gap-1">
                <button
                  onClick={() => onDecrease(key, isBundle ? null : item.size)}
                  aria-label="Decrease quantity"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white shadow-soft-xs flex items-center justify-center hover:text-red-600 active:scale-90 transition-all text-gray-600"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <motion.span
                  key={item.quantity}
                  initial={{ scale: reduce ? 1 : 1.3, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-semibold text-base md:text-lg w-7 text-center tabular-nums text-gray-900"
                >
                  {item.quantity}
                </motion.span>
                <button
                  onClick={() => onIncrease(key, isBundle ? null : item.size)}
                  aria-label="Increase quantity"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white shadow-soft-xs flex items-center justify-center hover:text-red-600 active:scale-90 transition-all text-gray-600"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <div className="font-semibold text-gray-900 text-base md:text-lg">
                  <span className="text-[11px] md:text-xs font-medium text-gray-500">Rs. </span>
                  {(price * item.quantity).toFixed(2)}
                </div>
                {hasSale ? (
                  <div className="text-[11px] md:text-xs text-gray-400">
                    <span className="line-through">Rs. {originalPrice.toFixed(2)}</span>
                    <span className="text-gray-300 ml-1">/ea</span>
                  </div>
                ) : (
                  <div className="text-[11px] md:text-xs text-gray-400">Rs. {price.toFixed(2)} /ea</div>
                )}
              </div>
            </div>

            {hasSale && savings > 0 && (
              <div className="mt-2 soft-badge soft-badge-success">
                <FiTag className="w-3 h-3" /> You save Rs. {savings}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Cart() {
  const reduce = useReducedMotion();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const incrementQuantity = useCartStore((s) => s.incrementQuantity);
  const decrementQuantity = useCartStore((s) => s.decrementQuantity);
  const saveCart = useCartStore((s) => s.saveCart);

  useEffect(() => { fetchCart() }, [fetchCart])

  const [saveStatus, setSaveStatus] = useState(null);

  const handleRemoveFromCart = (productId, size) => removeFromCart(productId, size);
  const handleClearCart = () => clearCart();
  const handleSaveCart = async () => {
    setSaveStatus("saving");
    try {
      await saveCart();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e) {
      setSaveStatus(e.message);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const calculateTotalBill = () => {
    return cart.reduce((total, item) => total + getCartItemPrice(item).effectivePrice * item.quantity, 0).toFixed(2);
  };

  const calculateActualTotalBill = () => {
    return cart.reduce((total, item) => total + (item.product?.price || item.price || 0) * item.quantity, 0).toFixed(2);
  };

  return (
    <main className="soft-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="soft-section-title text-3xl font-semibold text-gray-900 mb-4">
            <span className="soft-icon-tile"><FiShoppingCart className="h-5 w-5" /></span>Shopping Cart
          </h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        {!isAuthenticated ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="soft-card rounded-3xl mx-auto max-w-lg px-6 py-12 flex flex-col items-center text-center">
            <SignInRequired size={200} className="mb-6" />
            <h2 className="text-xl font-semibold text-gray-900">Sign in to view your cart</h2>
            <p className="mt-2 text-sm text-gray-500">Your cart items are saved to your account.</p>
            <Link to="/signin" className="soft-btn soft-btn-primary mt-6"><FiLogIn className="h-4 w-4" />Sign In<FiArrowRight className="h-4 w-4" /></Link>
          </motion.div>
        ) : cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="soft-card rounded-3xl mx-auto max-w-lg px-6 py-12 flex flex-col items-center text-center">
            <EmptyCart size={200} className="mb-6" />
            <h2 className="text-xl font-semibold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-500">Looks like you haven&apos;t added anything yet.</p>
            <Link to="/productlist/all" className="soft-btn soft-btn-primary mt-6"><FiShoppingBag className="h-4 w-4" />Continue Shopping<FiArrowRight className="h-4 w-4" /></Link>
          </motion.div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 min-w-0 space-y-4">
              <AnimatePresence initial={false}>
                {cart.map((item, index) => (
                  <CartItem
                    key={item._id || `${item.product?._id}-${item.size}`}
                    item={item}
                    onIncrease={incrementQuantity}
                    onDecrease={decrementQuantity}
                    onRemove={handleRemoveFromCart}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="soft-card rounded-3xl w-full md:w-[400px] flex-shrink-0 p-6 h-fit sticky top-24"
            >
              <h2 className="soft-section-title text-xl font-semibold text-gray-900 mb-6">
                <span className="soft-icon-tile soft-icon-tile-sm"><FiCreditCard className="h-4 w-4" /></span>Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 inline-flex items-center gap-2"><FiTag className="h-4 w-4 text-red-500" />Subtotal</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">Rs {calculateActualTotalBill()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 inline-flex items-center gap-2"><FiPercent className="h-4 w-4 text-red-500" />Discount</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">Rs {(Number(calculateActualTotalBill()) - Number(calculateTotalBill())).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 inline-flex items-center gap-2"><FiTruck className="h-4 w-4 text-red-500" />Shipping</span>
                  <span className="font-semibold text-gray-900">{Number(calculateTotalBill()) >= 2000 ? <span className="soft-badge soft-badge-success">FREE</span> : "Rs. 200"}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-red-600">Rs. {(Number(calculateTotalBill()) + (Number(calculateTotalBill()) >= 2000 ? 0 : 200)).toFixed(2)}</span>
                </div>
              </div>

              <div className="soft-card-inset rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <FiTruck className="h-4 w-4 text-red-600 flex-shrink-0" />
                  {Number(calculateTotalBill()) >= 2000
                    ? "You've got FREE shipping on this order!"
                    : `Add Rs. ${(2000 - Number(calculateTotalBill())).toFixed(2)} more to get free shipping!`}
                </p>
                <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-red-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (Number(calculateTotalBill()) / 2000) * 100)}%` }}
                    transition={{ duration: reduce ? 0 : 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3"><FiPackage className="h-4 w-4 text-red-500" />Cart Options</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCart}
                    disabled={saveStatus === "saving"}
                    className={`soft-btn soft-btn-sm ${
                      saveStatus === "saved"
                        ? "soft-btn-primary"
                        : saveStatus && saveStatus !== "saving"
                        ? "soft-btn-secondary"
                        : "soft-btn-ghost"
                    }`}
                  >
                    {saveStatus === "saving" ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : saveStatus === "saved" ? (
                      <FiCheck className="w-4 h-4" />
                    ) : saveStatus ? (
                      <FiAlertCircle className="w-4 h-4" />
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    <span>
                      {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : saveStatus ? "Error" : "Save Cart"}
                    </span>
                  </button>
                  <button onClick={handleClearCart} className="soft-btn soft-btn-sm soft-btn-secondary">
                    <FiTrash2 className="w-4 h-4" />
                    <span>Clear Cart</span>
                  </button>
                </div>
              </div>
              <Link to="/checkout" className="soft-btn soft-btn-primary soft-btn-lg w-full mb-3">
                <FiLock className="h-4 w-4" />Proceed to Checkout<FiArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/productlist/all" className="soft-btn soft-btn-ghost w-full">
                <FiShoppingBag className="h-4 w-4" />Continue Shopping
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}
