import { motion, AnimatePresence } from "motion/react"
import {
  AiOutlineSearch,
  AiOutlineUser,
  AiOutlineShoppingCart,
} from "react-icons/ai"
import { IoClose, IoMenu, IoPersonCircleOutline } from "react-icons/io5";
import {
  MdSports,
  MdFitnessCenter,
  MdDirectionsRun,
  MdSafetyDivider,
  MdAccessibility
} from 'react-icons/md';
import { BiLogInCircle } from "react-icons/bi";
import { FiHome, FiInfo, FiList } from "react-icons/fi";
import { useState } from "react"
import SearchModal from "../searchModal/SearchModal"
import { Link, NavLink } from "react-router-dom"
import { useMarketplaceStore } from "../../lib/marketplaceStore"
import CartModal from "../cartModal/CartModal";

export default function Navbar() {
  const cart = useMarketplaceStore((s) => s.cart);
  const isAuthenticated = useMarketplaceStore((s) => s.isAuthenticated);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { name: "Fitness Wear", href: "/productlist/Fitness Wear", icon: MdFitnessCenter },
    { name: "Sports Wear", href: "/productlist/Sports Wear", icon: MdSports },
    { name: "Gym Wear", href: "/productlist/Gym Wear", icon: MdDirectionsRun },
    { name: "Gloves", href: "/productlist/Gloves", icon: MdSafetyDivider },
    { name: "Safety Wear", href: "/productlist/Safety Wear", icon: MdSafetyDivider },
    { name: "Active Wear", href: "/productlist/Active Wear", icon: MdAccessibility }
  ]

  const navItems = [
    { name: "Catalog", href: "/productlist/All" },
    { name: "Categories", href: "#", hasDropdown: true },
    { name: "About", href: "/about" },
  ]

  return (
    <nav>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="md:block hidden bg-gray-100 shadow-sm border-b border-gray-50 sticky top-0 z-30"
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
                                      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)", scale: 1.02 }}
                                      className="flex items-center px-3 py-2 hover:bg-red-100 text-sm text-gray-700 rounded-md hover:text-red-600 transition-colors duration-150"
                                    >
                                      <IconComponent className="mr-2 p-[6px] text-[32px] text-red-700 bg-red-50 rounded-[6px]" />
                                      <span className="font-[600]">{category.name}</span>
                                    </motion.div>
                                  </NavLink>
                                )
                              })}
                            </div>
                            <div className="mt-3 border-t border-gray-100">
                              <NavLink to="/productlist/All">
                                <motion.div whileHover={{ x: 5 }} className="block px-3 py-2 text-[12px] underline underline-offset-2 font-medium text-red-600 hover:text-red-700">View All Categories →</motion.div>
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
              <div className="flex items-center space-x-4">
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setIsSearchModalOpen(true)}
                  whileHover={{ scale: 0.99 }}
                >
                  <AiOutlineSearch className="w-6 h-6 text-gray-600 hover:text-red-600" />
                </motion.button>

                {isAuthenticated ? (
                  <Link to="/profile">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="hidden md:flex p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                    >
                      <AiOutlineUser className="w-6 h-6" />
                    </motion.button>
                  </Link>
                ) : (
                  <Link to="/signin">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="hidden md:flex text-gray-600 hover:text-red-600 transition-colors duration-200"
                    >
                      <BiLogInCircle className="w-6 h-6" />
                    </motion.button>
                  </Link>
                )}

                {isAuthenticated && (
                  <>
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
                        <AiOutlineShoppingCart className="w-5 h-5" />
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        <CartModal isOpen={isCartOpen} onClose={closeCartModal} />
      </motion.header>

      <header>
        <div className="relative text-white md:hidden">
          <div className="flex items-center h-[70px] justify-between bg-white border-b-[2px] border-gray-200 shadow-sm px-4 py-2 relative">
            <NavLink to="/">
              <div className="flex items-center">
                <motion.div initial={{ opacity: 1 }} animate={{ opacity: isMenuOpen ? 0 : 1 }} transition={{ duration: 0.2 }}>
                  <img src="/vite.svg" alt="DiObral" className="md:w-[32px] w-[35px] h-[35px] md:h-[32px]" />
                </motion.div>
                <motion.div
                  className="text-[28px] font-bold"
                  initial={{ x: 40 }}
                  animate={{ x: isMenuOpen ? -40 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex">
                    <div className="text-red-700 ml-[6px] md:text-[25px] text-[21px] font-bold">Diobral</div>
                  </div>
                </motion.div>
              </div>
            </NavLink>
            <div className="flex">
              {isAuthenticated &&
                <motion.button
                  onClick={openCartModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="relative bg-gradient-to-r from-red-700 via-red-900 to-red-700 text-white p-2 mr-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                    <AiOutlineShoppingCart className="w-5 h-5" />
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
                        <motion.span initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>{cartLength}</motion.span>
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
              }
              <motion.div
                key={isMenuOpen ? 'close' : 'menu'}
                initial={{ opacity: 0, rotate: isMenuOpen ? 180 : -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: isMenuOpen ? -180 : 180 }}
                transition={{ duration: 0.3 }}
                className="cursor-pointer text-gray-400"
                onClick={handleMenuToggle}
              >
                {isMenuOpen ? <IoClose size={35} /> : <IoMenu size={35} />}
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ scaleX: 0, height: 0 }}
                animate={{ scaleX: 1, height: "390px", transition: { duration: 0.5 } }}
                exit={{ scaleX: 0, height: 0, transition: { duration: 0.3, delay: 0.1 } }}
                style={{ transformOrigin: "right" }}
                className="top-[25px] left-[15px] right-[15px] fixed z-[999] mt-[65px] overflow-hidden pb[45px] inset-0 bg-white border-[2px] border-gray-200 shadow-2xl flex rounded-[10px] flex-col h-screen px-4 py-3"
              >
                <div className="my-[10px]"></div>
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { duration: 0.5, delay: 0.5 } }}
                  exit={{ x: -100, opacity: 0, transition: { duration: 0.2 } }}
                  className="flex flex-col"
                >
                  <button onClick={handleSearchBar} className="w-full flex px-4 py-2 rounded-[15px] border-[2px] border-gray-100 shadow-sm">
                    <AiOutlineSearch className="text-[24px] text-gray-400" />
                    <p className="text-gray-400 pl-[12px]">Search Products ....</p>
                  </button>
                  <div className="flex flex-col mt-5 space-y-4">
                    <div className="flex justify-between items-center space-x-2 px-2">
                      <NavLink to="/" onClick={handleMenuToggle} className="flex items-center text-red-700 text-[15px] font-[600] hover:text-red-800">
                        <FiHome className="mr-2" />Home
                      </NavLink>
                      <NavLink to="/about" onClick={handleMenuToggle} className="flex items-center text-red-700 text-[15px] font-[600] hover:text-red-800">
                        <FiInfo className="mr-2" />About
                      </NavLink>
                      <NavLink to="/productlist/All" onClick={handleMenuToggle} className="flex items-center text-red-700 text-[15px] font-[600] hover:text-red-800">
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
                                onClick={handleMenuToggle}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:text-red-600 transition-colors duration-150"
                              >
                                <IconComponent className="mr-2 p-[6px] text-[28px] text-red-700 bg-red-50 rounded-[6px]" />
                                <span className="font-[600]">{category.name}</span>
                              </motion.button>
                            </NavLink>
                          )
                        })}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <NavLink to="/productlist/All">
                          <motion.button onClick={handleMenuToggle} whileHover={{ x: 5 }} className="block px-3 py-2 text-[12px] underline underline-offset-2 font-medium text-red-600 hover:text-red-700">View All Categories →</motion.button>
                        </NavLink>
                        {isAuthenticated ? (
                          <div className="flex items-center">
                            <NavLink onClick={handleMenuToggle} to="/profile" className="flex items-center bg-red-50 rounded-[12px] py-[4px] px-3">
                              <IoPersonCircleOutline className="text-red-700 text-[20px] mt-[1px] mr-[6px]" />
                              <span className="font-medium text-[13px] text-red-700">My Profile</span>
                            </NavLink>
                          </div>
                        ) : (
                          <NavLink to="/signin" onClick={handleMenuToggle} className="text-white text-[11px] font-[600] text-center py-[4px] bg-red-700 border border-white px-[12px] rounded-lg">Start Shopping</NavLink>
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
      </header>
    </nav>
  )
}
