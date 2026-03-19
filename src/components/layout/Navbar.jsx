import { motion, AnimatePresence } from "motion/react"
import {
  AiOutlineSearch,
  AiOutlineUser,
  AiOutlineShoppingCart,
} from "react-icons/ai"
import { IoPersonCircleOutline } from "react-icons/io5";
import {
  MdSports,
  MdFitnessCenter,
  MdDirectionsRun,
  MdSafetyDivider,
  MdAccessibility,
  MdCheckroom,
  MdHiking
} from 'react-icons/md';
import { BiLogInCircle } from "react-icons/bi";
import { FiHeart, FiHome, FiInfo, FiList } from "react-icons/fi";
import { useEffect, useState, useRef } from "react"
import SearchModal from "../searchModal/SearchModal"
import { Link, NavLink } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"
import CartModal from "../cartModal/CartModal";

export default function Navbar() {
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setShowNav(currentY <= lastScrollY.current || currentY <= 50)
      lastScrollY.current = currentY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated, fetchCart])
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  const openCartModal = () => setIsCartOpen(true);
  const closeCartModal = () => setIsCartOpen(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchBar = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsSearchModalOpen(true)
  };

  const cartLength = cart.length;

  const categories = [
    { name: "Compressions", href: "/productlist/compressions", icon: MdFitnessCenter },
    { name: "Gym Hoodies", href: "/productlist/gym-hoodies", icon: MdSports },
    { name: "Shorts", href: "/productlist/shorts", icon: MdDirectionsRun },
    { name: "T-Shirts", href: "/productlist/t-shirts", icon: MdAccessibility },
    { name: "Tank Tops", href: "/productlist/tank-tops", icon: MdSafetyDivider },
    { name: "Trousers", href: "/productlist/trousers", icon: MdCheckroom }
  ]

  const navItems = [
    { name: "Catalog", href: "/productlist/all" },
    { name: "Categories", href: "#", hasDropdown: true },
    { name: "About", href: "/about" },
  ]

  return (
    <nav>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: showNav ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:block hidden fixed top-0 inset-x-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <motion.div whileHover={{ scale: 1.05 }}>
              <NavLink to="/" className="h-[55px] pt-[5px] flex items-center justify-center w-full pb-[5px] overflow-hidden">
                <img src="/vite.svg" alt="DiObral" className="w-[35px] h-[35px]" />
                <div className="flex flex-col">
                  <div className="text-red-700 ml-[4px] text-[20px] font-bold">DiObral</div>
                </div>
              </NavLink>
            </motion.div>

            <div className="flex xl:ml-[-25px] bg-white px-5 py-3 rounded-[18px] border-t-[2px] border-gray-200 shadow-lg items-center space-x-6">
              {navItems.map((item, index) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setHoveredCategory(true)}
                  onMouseLeave={() => item.hasDropdown && setHoveredCategory(false)}
                >
                  <NavLink to={item.href}>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      whileHover={{ y: -2 }}
                      className="text-gray-700 hover:text-red-700 font-medium transition-colors duration-200 relative group"
                    >
                      {item.name}
                      <motion.div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-700 group-hover:w-full transition-all duration-300" />
                      {item.hasDropdown && <span className="ml-1 inline-block">▾</span>}
                    </motion.div>
                  </NavLink>

                  {item.name === "Categories" && (
                    <AnimatePresence>
                      {hoveredCategory && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-[-125px] mt-5 w-[350px] rounded-lg bg-white shadow-md border-[2px] border-gray-200 z-[999]"
                        >
                          <div className="p-3">
                            <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Browse Categories</h3>
                            <div className="grid grid-cols-2 gap-1">
                              {categories.map((category) => {
                                const IconComponent = category.icon
                                return (
                                  <NavLink key={category.name} to={category.href}>
                                    <motion.div
                                      className="flex items-center px-3 py-2 hover:bg-red-50 text-sm text-gray-700 rounded-md hover:text-red-600 transition-colors duration-150"
                                    >
                                      <IconComponent className="mr-2 p-[6px] text-[32px] text-red-700 bg-red-50 rounded-[6px]" />
                                      <span className="font-[600]">{category.name}</span>
                                    </motion.div>
                                  </NavLink>
                                )
                              })}
                            </div>
                            <div className="mt-3 flex justify-between border-t border-gray-100">
                              <NavLink to="/productlist/all">
                                <motion.div whileHover={{ x: 5 }} className="block px-3 py-2 text-[12px] underline underline-offset-2 font-medium text-red-600 hover:text-red-700">View All Categories →</motion.div>
                              </NavLink>

                              <NavLink to="/bundles">
                                <motion.div whileHover={{ x: 5 }} className="block px-4 bg-red-700 py-1.5 rounded-3xl text-[12px] font-medium text-white hover:bg-red-600">View Bundles →</motion.div>
                              </NavLink>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
            
            <div className={`flex bg-white px-5 ${isAuthenticated ? 'py-1' : 'py-2'} rounded-[18px] border-t-[2px] border-gray-200 shadow-lg`}>
              <div className="flex items-center space-x-3 md:space-x-2">
                {/* Search Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setIsSearchModalOpen(true)}
                  whileHover={{ scale: 0.99 }}
                  className="flex items-center justify-center p-2"
                >
                  <AiOutlineSearch className="w-6 h-6 text-gray-600 hover:text-red-600" />
                </motion.button>
            
                {/* Wishlist Link */}
                {isAuthenticated && (
                  <Link to="/wishlist" className="hidden md:flex items-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                    >
                      <FiHeart className="w-5 h-5" />
                    </motion.button>
                  </Link>
                )}
            
                {/* User / Auth Link */}
                {isAuthenticated ? (
                  <Link to="/profile" className="hidden md:flex items-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                    >
                      <AiOutlineUser className="w-6 h-6" />
                    </motion.button>
                  </Link>
                ) : (
                  <Link to="/signin" className="hidden md:flex items-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                    >
                      <BiLogInCircle className="w-6 h-6" />
                    </motion.button>
                  </Link>
                )}
            
                {/* Shopping Cart Button */}
                {isAuthenticated && (
                  <motion.button
                    onClick={openCartModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="relative bg-gradient-to-r from-red-700 via-red-900 to-red-700 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                      <AiOutlineShoppingCart className="w-6 h-6" />
                    </motion.div>
                    <AnimatePresence>
                      {cartLength > 0 && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          key={cartLength}
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <motion.span
                            initial={{ scale: 1.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            {cartLength}
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:opacity-30"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1.2, opacity: 0.3 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        <CartModal isOpen={isCartOpen} onClose={closeCartModal} />
      </motion.header>

      <motion.header
        initial={{ y: -120 }}
        animate={{ y: showNav ? 0 : -120 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden fixed top-3 left-3 right-3 z-30 rounded-2xl shadow-lg bg-white border border-gray-200"
      >
        <div className="relative">
          <div className="flex items-center h-[70px] justify-between px-4 py-2">
            <NavLink to="/">
              <div className="flex items-center">
                <img src="/vite.svg" alt="DiObral" className="w-[35px] h-[35px]" />
                <div className="flex">
                  <div className="text-red-700 ml-[6px] text-[21px] font-bold">Diobral</div>
                </div>
              </div>
            </NavLink>
            <div className="flex">
              {isAuthenticated &&
                <button
                  onClick={openCartModal}
                  className="relative bg-gradient-to-r from-red-700 via-red-900 to-red-700 text-white p-2 mr-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <AiOutlineShoppingCart className="w-5 h-5" />
                  <AnimatePresence>
                    {cartLength > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        key={cartLength}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <motion.span initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>{cartLength}</motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              }
              <button
                onClick={handleMenuToggle}
                className="w-8 h-8 relative flex flex-col items-center justify-center gap-[5px] group"
              >
                <motion.span
                  animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-[2px] bg-gray-700 rounded-full origin-center"
                />
                <motion.span
                  animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block w-6 h-[2px] bg-gray-700 rounded-full"
                />
                <motion.span
                  animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-[2px] bg-gray-700 rounded-full origin-center"
                />
              </button>
            </div>
          </div>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ scaleY: 0, height: 0 }}
                animate={{ scaleY: 1, height: "410px", transition: { duration: 0.4, ease: "easeOut" } }}
                exit={{ scaleY: 0, height: 0, transition: { duration: 0.3, delay: 0.05 } }}
                style={{ transformOrigin: "bottom right" }}
                className="bottom-2 left-3 right-3 fixed z-[999] overflow-hidden bg-white border-2 border-gray-300 shadow-xl flex rounded-2xl flex-col px-4 py-3"
              >
                <div className="my-2.5"></div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { duration: 0.35, delay: 0.15 } }}
                  exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
                  className="flex flex-col origin-center"
                >
                  <button onClick={handleSearchBar} className="w-full flex px-4 py-2 rounded-[15px] border-2 border-gray-100 shadow-sm">
                    <AiOutlineSearch className="text-[24px] text-gray-400" />
                    <p className="text-gray-400 pl-3">Search Products ....</p>
                  </button>
                  
                  <div className="flex flex-col mt-8 space-y-4">
                    <div className="flex justify-between items-center space-x-2 px-2">
                      <NavLink to="/" onClick={handleMenuToggle} className="flex items-center text-red-700 text-[15px] font-[600] hover:text-red-800">
                        <FiHome className="mr-2" />Home
                      </NavLink>
                      <NavLink to="/about" onClick={handleMenuToggle} className="flex items-center text-red-700 text-[15px] font-[600] hover:text-red-800">
                        <FiInfo className="mr-2" />About
                      </NavLink>
                      <NavLink to="/productlist/all" onClick={handleMenuToggle} className="flex items-center text-red-700 text-[15px] font-[600] hover:text-red-800">
                        <FiList className="mr-2" />Catalog
                      </NavLink>
                    </div>
                    <div className="pt-5 border-t-[2px] border-gray-200">
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Browse Categories</h3>
                      <div className="grid grid-cols-2 gap-1">
                        {categories.map((category) => {
                          const IconComponent = category.icon
                          return (
                            <NavLink key={category.name} to={category.href}>
                              <motion.button
                                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)", scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleMenuToggle}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:text-red-600 transition-colors duration-150 w-full"
                              >
                                <IconComponent className="mr-2 p-[6px] text-[28px] text-red-700 bg-red-50 rounded-[6px]" />
                                <span className="font-[600]">{category.name}</span>
                              </motion.button>
                            </NavLink>
                          )
                        })}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <NavLink to="/productlist/all">
                          <motion.button 
                            onClick={handleMenuToggle} 
                            whileHover={{ scale: 1.03 }} 
                            className="block px-3 py-2 text-[12px] underline underline-offset-2 font-medium text-red-600 hover:text-red-700"
                          >
                            View All Categories →
                          </motion.button>
                        </NavLink>
                        {isAuthenticated ? (
                          <div className="flex items-center">
                            <NavLink onClick={handleMenuToggle} to="/profile" className="flex items-center bg-red-50 rounded-[12px] py-[4px] px-3">
                              <IoPersonCircleOutline className="text-red-700 text-[20px] mt-[1px] mr-[6px]" />
                              <span className="font-medium text-[13px] text-red-700">My Profile</span>
                            </NavLink>
                          </div>
                        ) : (
                          <NavLink to="/signin" onClick={handleMenuToggle} className="text-white text-[11px] font-[600] text-center py-[4px] bg-red-700 border border-white px-[12px] rounded-lg">
                            Start Shopping
                          </NavLink>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        <CartModal isOpen={isCartOpen} onClose={closeCartModal} />
      </motion.header>
    </nav>
  )
}
