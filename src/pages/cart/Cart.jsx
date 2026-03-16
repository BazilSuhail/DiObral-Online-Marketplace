import { useEffect } from "react"
import { motion } from "motion/react"
import { useCartStore } from "../../store/cartStore"
import { useAuthStore } from "../../store/authStore"
import { post } from "../../api/client"
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from "react-icons/fi"
import { Link } from "react-router-dom"
import Button from "../../utilities/Button.jsx"
import { FaSave, FaTrashAlt } from "react-icons/fa"

const Separator = ({ className = "" }) => <hr className={`border-gray-200 ${className}`} />

const CartItem = ({ item, onIncrease, onDecrease, onRemove, index }) => {
  const product = item.product;
  if (!product) return null;

  const price = item.price;
  const originalPrice = product.price;
  const isDiscounted = price < originalPrice;
  const discountPct = isDiscounted ? Math.round((1 - price / originalPrice) * 100) : 0;
  const savings = isDiscounted ? ((originalPrice - price) * item.quantity).toFixed(2) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex gap-4 md:gap-6">
        <div className="relative flex-shrink-0">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${product.image}`}
            alt={product.name}
            className="rounded-xl border border-gray-200 w-[110px] h-[110px] md:w-[140px] md:h-[140px] object-cover"
          />
          {isDiscounted && (
            <div className="absolute top-0 left-0 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-tl-xl rounded-br-xl shadow-sm">
              {discountPct}% OFF
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
            x{item.quantity}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-tight truncate">{product.name}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-400">
                <span>Size: <span className="font-medium text-gray-600">{item.size}</span></span>
                <span className="hidden md:inline text-gray-200">|</span>
                <span>Stock: <span className={`font-medium ${product.stock > 5 ? "text-green-600" : "text-amber-600"}`}>{product.stock > 5 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out"}</span></span>
              </div>
            </div>
            <button
              onClick={() => onRemove(product._id, item.size)}
              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
            >
              <FiTrash2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="mt-auto pt-3 md:pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDecrease(product._id, item.size)}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-500"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-base md:text-lg w-7 text-center tabular-nums text-gray-900">{item.quantity}</span>
                <button
                  onClick={() => onIncrease(product._id, item.size)}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-500"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-900 text-base md:text-lg">
                  <span className="text-[11px] md:text-xs font-medium text-gray-500">Rs. </span>
                  {(price * item.quantity).toFixed(2)}
                </div>
                {isDiscounted ? (
                  <div className="text-[11px] md:text-xs text-gray-400">
                    <span className="line-through">Rs. {originalPrice.toFixed(2)}</span>
                    <span className="text-gray-300 ml-1">/ea</span>
                  </div>
                ) : (
                  <div className="text-[11px] md:text-xs text-gray-400">Rs. {price.toFixed(2)} /ea</div>
                )}
              </div>
            </div>

            {isDiscounted && savings > 0 && (
              <div className="mt-2 text-[11px] md:text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 inline-flex items-center gap-1">
                <FiShoppingBag className="w-3 h-3" /> You save Rs. {savings}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Cart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  useEffect(() => { fetchCart() }, [fetchCart])

  const getQuantity = (productId, size) => {
    const item = cart.find(c => c.product?._id === productId && c.size === size);
    return item ? item.quantity : 1;
  };

  const handleIncreaseQuantity = (productId, size) => updateQuantity(productId, size, getQuantity(productId, size) + 1);
  const handleDecreaseQuantity = (productId, size) => updateQuantity(productId, size, Math.max(getQuantity(productId, size) - 1, 1));
  const handleRemoveFromCart = (productId, size) => removeFromCart(productId, size);
  const handleClearCart = () => clearCart();

  const calculateTotalBill = () => {
    return cart.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0).toFixed(2);
  };

  const calculateActualTotalBill = () => {
    return cart.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0).toFixed(2);
  };

  const handleSaveCart = async () => {
    alert('Cart is already saved on the server.');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        {!isAuthenticated ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-5">
              <FiShoppingBag className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your cart</h2>
            <p className="text-sm text-gray-400 mb-8">Your cart items are saved to your account.</p>
            <Link to="/signin">
              <Button variant="red" className="inline-flex items-center gap-2">Sign In <FiArrowRight className="w-4 h-4" /></Button>
            </Link>
          </motion.div>
        ) : cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 font-[600] max-w-[220px] mx-auto mt-6 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Button variant="red">
              <Link to="/productlist/All" className="flex items-center">Continue Shopping<FiArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 min-w-0 space-y-4">
              {cart.map((item, index) => (
                <CartItem
                  key={`${item.product?._id}-${item.size}`}
                  item={item}
                  onIncrease={handleIncreaseQuantity}
                  onDecrease={handleDecreaseQuantity}
                  onRemove={handleRemoveFromCart}
                  index={index}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full md:w-[400px] flex-shrink-0 bg-white border-[2px] border-gray-200 rounded-xl p-6 h-fit sticky top-24"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs {calculateActualTotalBill()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium">Rs {(Number(calculateActualTotalBill()) - Number(calculateTotalBill())).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Rs. 200</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>Rs. {(Number(calculateTotalBill()) + 200).toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">Add Rs. {(Number(calculateTotalBill()) + 100).toFixed(2)} more to get free shipping!</p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-3">Cart Options</label>
                <div className="flex gap-2">
                  <button onClick={handleSaveCart} className="group flex items-center justify-center py-[6px] px-[12px] rounded-[8px] text-green-50 font-[600] text-[13px] bg-green-700 hover:bg-green-800 transition-all overflow-hidden">
                    <FaSave className="text-green-50 text-[15px] group-hover:mr-2 mb-[1px] transition-all" />
                    <span className="hidden group-hover:inline whitespace-nowrap mb-[1px] transition-all">Save Cart</span>
                  </button>
                  <button onClick={handleClearCart} className="group flex items-center justify-center py-[6px] px-[12px] rounded-[8px] text-red-50 font-[600] text-[13px] bg-red-700 hover:bg-red-800 transition-all overflow-hidden">
                    <FaTrashAlt className="text-red-50 text-[15px] group-hover:mr-2 transition-all" />
                    <span className="hidden group-hover:inline whitespace-nowrap mb-[1px] transition-all">Clear Cart</span>
                  </button>
                </div>
              </div>
              <Link to="/checkout">
                <Button className="w-full bg-red-900 hover:bg-red-800 text-white mb-4" size="lg">Proceed to Checkout</Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Link to="/productlist/All">Continue Shopping</Link>
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}
