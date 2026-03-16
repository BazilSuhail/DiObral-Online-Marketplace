import { motion, AnimatePresence } from "motion/react";
import { useMarketplaceStore } from '../../lib/marketplaceStore';
import { useApiQuery } from '../../api/adapter';
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BsCartDash } from 'react-icons/bs';

const panelVariants = {
  hidden: { width: 0 },
  visible: { width: 330, transition: { duration: 0.4, ease: 'easeInOut' } },
  exit: { width: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
};

const contentVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { delay: 0.2, duration: 0.3, ease: 'easeOut' } },
  exit: { x: -100, opacity: 0, transition: { duration: 0.1, ease: 'easeIn' } },
};

const CartItem = ({ id, size, quantity, onIncrease, onDecrease, onRemove, index }) => {
  const { data: product } = useApiQuery(`/fetchproducts/products/${id}`);

  if (!product) return null;

  const discountedPrice = product.sale
    ? product.price - (product.price * product.sale) / 100
    : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="mb-[25px] border-b-[2px] pb-[10px] border-gray-200"
    >
      <div className="flex gap-4">
        <img
          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${product.image}`}
          alt={product.name}
          className="rounded-lg border-[2px] border-gray-200 w-[60px] h-[80px] object-fit"
        />
        <div className="flex-1">
          <button onClick={() => onRemove(id, size)} className="text-gray-400 w-full flex justify-end hover:text-red-500 transition-colors">
            <FiTrash2 className="w-4 h-4 mt-[-6px]" />
          </button>
          <h3 className="font-semibold text-[13px] text-gray-900">
            {product.name?.slice(0, 27)}{product.name?.length > 27 && "..."}
          </h3>
          <div className="text-[12px] text-gray-600 mb-2"><p>Size: {size}</p></div>
          <div className="flex items-center space-x-[6px]">
            <button onClick={() => onDecrease(id, size)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <FiMinus className="w-3 h-3" />
            </button>
            <span className="font-medium w-4 text-center">{quantity}</span>
            <button onClick={() => onIncrease(id, size)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <FiPlus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CartModal = ({ isOpen, onClose }) => {
  const cart = useMarketplaceStore((s) => s.cart);
  const updateQuantity = useMarketplaceStore((s) => s.updateQuantity);
  const removeFromCart = useMarketplaceStore((s) => s.removeFromCart);

  const getQuantity = (id, size) => {
    const item = cart.find(product => product.id === id && product.size === size);
    return item ? item.quantity : 1;
  };

  const handleIncreaseQuantity = (id, size) => {
    updateQuantity(id, size, getQuantity(id, size) + 1);
  };

  const handleDecreaseQuantity = (id, size) => {
    updateQuantity(id, size, Math.max(getQuantity(id, size) - 1, 1));
  };

  const handleRemoveFromCart = (id, size) => {
    removeFromCart(id, size);
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
                      key={`${item.id}-${item.size}`}
                      id={item.id}
                      size={item.size}
                      quantity={item.quantity}
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
