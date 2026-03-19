import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from '../../store/cartStore';
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BsCartDash } from 'react-icons/bs';
import { getCartItemPrice } from '../../lib/utils';

const panelVariants = {
  hidden: { width: 0 },
  visible: { width: 370, transition: { duration: 0.4, ease: 'easeInOut' } },
  exit: { width: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
};

const contentVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { delay: 0.2, duration: 0.3, ease: 'easeOut' } },
  exit: { x: -100, opacity: 0, transition: { duration: 0.1, ease: 'easeIn' } },
};

const CartItem = ({ item, onIncrease, onDecrease, onRemove, index }) => {
  const product = item.product;
  if (!product) return null;

  const { originalPrice, effectivePrice, hasSale, discountPct } = getCartItemPrice(item);
  const price = effectivePrice;
  const savings = hasSale ? ((originalPrice - price) * item.quantity).toFixed(2) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm"
    >
      <div className="flex gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${product.image}`}
            alt={product.name}
            className="rounded-lg border border-gray-200 w-[72px] h-[72px] object-cover"
          />
          {hasSale && (
            <div className="absolute top-0 left-0 bg-gradient-to-br from-red-500 to-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-lg rounded-br-md">
              {discountPct}%
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md leading-none">
            x{item.quantity}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-1">
            <h3 className="font-semibold text-[13px] text-gray-900 leading-tight truncate">
              {product.name?.slice(0, 22)}{product.name?.length > 22 && "..."}
            </h3>
            <button onClick={() => onRemove(product._id, item.size)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
            <span>Size: <span className="font-medium text-gray-600">{item.size}</span></span>
            <span className="text-gray-200">|</span>
            <span className={`font-medium ${product.stock > 5 ? "text-green-600" : "text-amber-600"}`}>{product.stock > 5 ? "In Stock" : product.stock > 0 ? "Low" : "Out"}</span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <button onClick={() => onDecrease(product._id, item.size)} className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-500">
                <FiMinus className="w-3 h-3" />
              </button>
              <span className="font-semibold text-[13px] w-4 text-center tabular-nums text-gray-900">{item.quantity}</span>
              <button onClick={() => onIncrease(product._id, item.size)} className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-500">
                <FiPlus className="w-3 h-3" />
              </button>
            </div>

            <div className="text-right">
              <div className="font-bold text-gray-900 text-[13px]">
                Rs. {(price * item.quantity).toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-400">
                {hasSale ? (
                  <span><span className="line-through">Rs. {originalPrice.toFixed(2)}</span></span>
                ) : (
                  <span>Rs. {price.toFixed(2)} /ea</span>
                )}
              </div>
            </div>
          </div>

          {hasSale && savings > 0 && (
            <div className="mt-1.5 text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-0.5 inline-flex items-center gap-1">
              <FiShoppingBag className="w-2.5 h-2.5" /> Save Rs. {savings}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CartModal = ({ isOpen, onClose }) => {
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  useEffect(() => {
    if (isOpen) fetchCart()
  }, [isOpen, fetchCart])

  const getQuantity = (productId, size) => {
    const item = cart.find(c => c.product?._id === productId && c.size === size);
    return item ? item.quantity : 1;
  };

  const handleIncreaseQuantity = (productId, size) => {
    updateQuantity(productId, size, getQuantity(productId, size) + 1);
  };

  const handleDecreaseQuantity = (productId, size) => {
    updateQuantity(productId, size, Math.max(getQuantity(productId, size) - 1, 1));
  };

  const handleRemoveFromCart = (productId, size) => {
    removeFromCart(productId, size);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-3 bottom-3 right-2 h-auto bg-white z-50 shadow-lg overflow-hidden rounded-lg"
          >
            <div className="flex flex-col h-full">
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:none] [-ms-overflow-style:none]"
              >
                <div className="pb-3 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold">Your Cart</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black text-[28px] mt-[-5px]">&times;</button>
                  </div>
                </div>
                {cart.length === 0 ? (
                  <div className="flex flex-col pt-40 items-center">
                    <BsCartDash className="mx-auto w-40 h-40 text-gray-300" />
                    <span className="text-gray-400 text-[14px] mt-5 font-[600]">Your cart is empty</span>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <CartItem
                      key={`${item.product?._id}-${item.size}`}
                      item={item}
                      onIncrease={handleIncreaseQuantity}
                      onDecrease={handleDecreaseQuantity}
                      onRemove={handleRemoveFromCart}
                      index={index}
                    />
                  ))
                )}
              </motion.div>
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="px-6 py-3 bg-white border-t border-gray-200"
              >
                <Link to="/cart">
                  <button
                    onClick={onClose}
                    className={`w-full flex items-center bg-gradient-to-r ${cart.length === 0 ? 'from-red-300 via-red-300 to-red-300' : 'from-red-900 via-red-700 to-red-900'} justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors`}
                    disabled={cart.length === 0}
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>Go to Cart</span>
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
