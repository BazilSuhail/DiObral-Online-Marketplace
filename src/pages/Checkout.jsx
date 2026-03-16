import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceStore } from '../lib/marketplaceStore';
import { post, apiCall } from '../api/client';
import { useQueries } from '@tanstack/react-query';
import { motion } from "motion/react"
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { FiCheck, FiMapPin, FiUser, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import Button from '../utilities/Button.jsx';
import ProfileInput from '../utilities/ProfileInput.jsx';

const CartItem = ({ id, size, quantity, index, product }) => {
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
          <h3 className="font-semibold mb-3 mt-1 text-gray-900">{product.name}</h3>
          <div className="text-[12px] md:text-sm text-gray-600 mb-4">
            <p>Qty: {quantity}</p>
            <p>Size: {size}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex md:flex-row flex-col items-center">
              <div className="font-semibold text-[12px] md:text-[16px] text-gray-900">
                <span className="text-[10px] md:text-[13px] font-[600] text-gray-700">Rs. </span>
                {discountedPrice.toFixed(2)}
              </div>
              {isDiscounted && (
                <div className="text-[10px] ml-[8px] text-center md:text-[13px] text-gray-500 line-through">Rs. {product.price.toFixed(2)}</div>
              )}
            </div>
            <div className="font-semibold text-gray-900">
              <span className="text-[13px] font-[600] text-gray-500">Total Price: </span>
              {(discountedPrice * quantity).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Checkout = () => {
  const cart = useMarketplaceStore((s) => s.cart);
  const clearCart = useMarketplaceStore((s) => s.clearCart);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', fullName: '', bio: '',
    address: { city: '', street: '', country: '' },
    contact: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/signin'); return; }
        const response = await apiCall('/auth/profile', 'GET');
        setFormData({
          email: response.email || '',
          fullName: response.fullName || '',
          bio: response.bio || '',
          address: response.address || { city: '', street: '', country: '' },
          contact: response.contact || ''
        });
      } catch {
        navigate('/signin');
      }
    };
    fetchProfile();
  }, []);

  const productQueries = useQueries({
    queries: cart.map(item => ({
      queryKey: [`/fetchproducts/products/${item.id}`],
      queryFn: () => apiCall(`/fetchproducts/products/${item.id}`, "GET"),
      staleTime: 1000 * 60 * 5,
    }))
  });

  const productMap = useMemo(() => {
    const map = {};
    cart.forEach((item, i) => { map[item.id] = productQueries[i]?.data || null; });
    return map;
  }, [cart, productQueries]);

  const calculateTotalBill = () => {
    return cart.reduce((total, item) => {
      const p = productMap[item.id];
      if (p) {
        const dp = p.sale ? p.price - (p.price * p.sale) / 100 : p.price;
        return total + dp * item.quantity;
      }
      return total;
    }, 0).toFixed(2);
  };

  const calculateActualTotalBill = () => {
    return cart.reduce((total, item) => {
      const p = productMap[item.id];
      return total + (p ? p.price * item.quantity : 0);
    }, 0).toFixed(2);
  };

  const handleConfirmOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('User not logged in'); return; }

    const userId = (() => {
      try { return JSON.parse(atob(token.split('.')[1])).id; } catch { return null; }
    })();

    const order = {
      items: cart.map(item => {
        const p = productMap[item.id];
        const dp = p?.sale ? p.price - (p.price * p.sale) / 100 : p?.price || 0;
        return {
          name: p?.name || 'Unknown',
          image: p?.image || '',
          price: p?.price || 0,
          size: item.size || 'No size',
          discountedPrice: dp,
          quantity: item.quantity
        };
      }),
      orderDate: new Date().toISOString(),
      total: calculateTotalBill()
    };

    try {
      await post(`/place-order/orders/${userId}`, order);
      alert('Order confirmed!');
      clearCart();
      await post('/cartState/cart/save', { userId, items: [] });
      navigate('/orders-tracking');
    } catch {
      alert('Failed to confirm order.');
    }
  };

  if (!cart.length) return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-5">
          <h1 className="text-[25px] font-bold text-gray-900">Checkout Invoice</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 font-[600] max-w-[220px] mx-auto mt-6 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button variant="red">
            <Link to="/productlist/All" className="flex items-center">Continue Shopping<FiArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </motion.div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-5">
          <h1 className="text-[25px] font-bold text-gray-900">Checkout Invoice</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-50 rounded-lg pb-6 pt-4 px-6 h-fit border-[2px] border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
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
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>Rs. {(Number(calculateTotalBill()) + 200).toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">Add Rs. {(Number(calculateTotalBill()) + 100).toFixed(2)} more to get free shipping!</p>
              </div>

              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <button onClick={handleConfirmOrder} className="w-full py-2 bg-gradient-to-r from-red-700 to-red-900 flex items-center justify-center rounded-[8px] hover:bg-gray-800 text-white">
                  <FiCheck className="mr-2" /> Place Order
                </button>
                <Link to="/productlist/All">
                  <Button variant="outline" className="w-full">Continue Shopping</Button>
                </Link>
              </div>
            </motion.div>
            {cart.map((item, index) => (
              <CartItem key={`${item.id}-${item.size}`} id={item.id} size={item.size} quantity={item.quantity} index={index} product={productMap[item.id]} />
            ))}
          </div>

          <div className="gap-6 lg:col-span-2">
            <div className="space-y-6 p-4 bg-white border-[2px] border-gray-200 rounded-xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiUser className="mr-2 text-red-600" /> Personal Details
                </h3>
                <div className="space-y-4">
                  <ProfileInput label="Full Name" value={formData.fullName} disabled className="bg-gray-50" />
                  <ProfileInput label="Email Address" type="email" value={formData.email} disabled className="bg-gray-50" />
                  <ProfileInput label="Phone Number" type="tel" value={formData.contact} disabled className="bg-gray-50" />
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-8 p-4 bg-white border-[2px] border-gray-200 rounded-xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiMapPin className="mr-2 text-red-600" /> Address Information
                </h3>
                <div className="space-y-4">
                  <ProfileInput label="Street Address" value={formData.address.street} disabled className="bg-gray-50" />
                  <div className="grid grid-cols-2 gap-4">
                    <ProfileInput label="City" value={formData.address.city} disabled className="bg-gray-50" />
                    <ProfileInput label="State" value={formData.address.state} disabled className="bg-gray-50" />
                  </div>
                  <ProfileInput label="Country" value={formData.address.country} disabled className="bg-gray-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
