import { useCallback, useEffect, useState, useMemo } from "react"
import { motion } from "motion/react"
import { useMarketplaceStore } from "../../lib/marketplaceStore"
import { post } from "../../api/client"
import { useQueries } from "@tanstack/react-query"
import { apiCall } from "../../api/client"
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from "react-icons/fi"
import { Link } from "react-router-dom"
import Button from "../../utilities/Button.jsx"
import { FaSave, FaTrashAlt } from "react-icons/fa"

const Separator = ({ className = "" }) => <hr className={`border-gray-200 ${className}`} />

const CartItem = ({ id, size, quantity, onIncrease, onDecrease, onRemove, index, product }) => {
  if (!product) return null;

  const discountedPrice = product.sale
    ? product.price - (product.price * product.sale) / 100
    : product.price;

  const isDiscounted = product.sale && discountedPrice < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-lg p-3 md:p-6"
    >
      <div className="flex gap-4">
        <img
          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${product.image}`}
          alt={product.name}
          className="rounded-lg border-[2px] border-gray-200 w-[110px] h-[120px] object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <button onClick={() => onRemove(id, size)} className="text-gray-400 hover:text-red-500 transition-colors">
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
          <div className="text-[12px] md:text-sm text-gray-600 mb-3">
            <p>Size: {size}</p>
            <p>Price Count: {(discountedPrice * quantity).toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => onDecrease(id, size)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <FiMinus className="w-4 h-4" />
              </button>
              <span className="font-medium w-8 text-center">{quantity}</span>
              <button onClick={() => onIncrease(id, size)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                <span className="text-[13px] font-[600] text-gray-700">Rs. </span>
                {discountedPrice.toFixed(2)}
              </div>
              {isDiscounted && (
                <div className="text-[11px] text-center md:text-sm text-gray-500 line-through">Rs. {product.price.toFixed(2)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Cart() {
  const cart = useMarketplaceStore((s) => s.cart);
  const removeFromCart = useMarketplaceStore((s) => s.removeFromCart);
  const clearCart = useMarketplaceStore((s) => s.clearCart);
  const updateQuantity = useMarketplaceStore((s) => s.updateQuantity);

  const [userId, setUserId] = useState(null);

  const decodeToken = useCallback((token) => {
    if (!token) return null;
    try { const p = token.split('.')[1]; return JSON.parse(atob(p)).id; }
    catch { return null; }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setUserId(decodeToken(token));
  }, [decodeToken]);

  const productQueries = useQueries({
    queries: cart.map(item => ({
      queryKey: [`/fetchproducts/products/${item.id}`],
      queryFn: () => apiCall(`/fetchproducts/products/${item.id}`, "GET"),
      staleTime: 1000 * 60 * 5,
    }))
  });

  const productMap = useMemo(() => {
    const map = {};
    cart.forEach((item, i) => {
      map[item.id] = productQueries[i]?.data || null;
    });
    return map;
  }, [cart, productQueries]);

  const getQuantity = (id, size) => {
    const item = cart.find(p => p.id === id && p.size === size);
    return item ? item.quantity : 1;
  };

  const handleIncreaseQuantity = (id, size) => updateQuantity(id, size, getQuantity(id, size) + 1);
  const handleDecreaseQuantity = (id, size) => updateQuantity(id, size, Math.max(getQuantity(id, size) - 1, 1));
  const handleRemoveFromCart = (id, size) => removeFromCart(id, size);
  const handleClearCart = () => clearCart();

  const calculateTotalBill = () => {
    return cart.reduce((total, item) => {
      const product = productMap[item.id];
      if (product) {
        const dp = product.sale ? product.price - (product.price * product.sale) / 100 : product.price;
        return total + dp * item.quantity;
      }
      return total;
    }, 0).toFixed(2);
  };

  const calculateActualTotalBill = () => {
    return cart.reduce((total, item) => {
      const product = productMap[item.id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0).toFixed(2);
  };

  const handleSaveCart = async () => {
    try {
      await post("/cartState/cart/save", { userId, items: cart });
      alert('Cart saved successfully!');
    } catch { alert('Failed to save cart.'); }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 font-[600] max-w-[220px] mx-auto mt-6 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Button variant="red">
              <Link to="/productlist/All" className="flex items-center">Continue Shopping<FiArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <CartItem
                  key={`${item.id}-${item.size}`}
                  id={item.id}
                  size={item.size}
                  quantity={item.quantity}
                  onIncrease={handleIncreaseQuantity}
                  onDecrease={handleDecreaseQuantity}
                  onRemove={handleRemoveFromCart}
                  index={index}
                  product={productMap[item.id]}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white border-[2px] border-gray-200 rounded-lg p-6 h-fit sticky top-24"
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
