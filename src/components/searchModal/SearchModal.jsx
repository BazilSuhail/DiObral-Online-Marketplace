import { motion, AnimatePresence } from "motion/react"
import { AiOutlineSearch, AiOutlineClose, AiOutlineClockCircle } from "react-icons/ai"
import { BiTrendingUp } from "react-icons/bi"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useApiQuery } from "../../api/adapter"

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef(null)
  const navigate = useNavigate()

  const { data: products } = useApiQuery("/api/products");

  const suggestions = (products?.products || [])
    .filter(p => searchQuery && p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape") onClose() }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      navigate(`/productlist/All?search=${encodeURIComponent(query.trim())}`)
      onClose()
      setSearchQuery("")
    }
  }

  const handleKeyPress = (e) => { if (e.key === "Enter") handleSearch() }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center p-4 border-b border-gray-100">
              <div className="flex-1 relative">
                <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input ref={searchInputRef} type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleKeyPress}
                  placeholder="Search for products, brands, categories..."
                  className="w-full pl-12 pr-4 py-3 text-sm md:text-lg border-0 focus:outline-none focus:ring-0 bg-gray-50 rounded-xl" />
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={onClose} className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <AiOutlineClose className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="max-h-96 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none]">
              {searchQuery.length > 0 ? (
                <div className="p-4">
                  <motion.button whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                    onClick={() => handleSearch()}
                    className="w-full flex items-center p-3 text-left rounded-lg hover:bg-blue-50 transition-colors">
                    <AiOutlineSearch className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Search for "<span className="font-semibold text-blue-600">{searchQuery}</span>"</span>
                  </motion.button>
                  {suggestions.length > 0 && (
                    <div className="mt-2 border-t border-gray-100 pt-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Suggestions</h3>
                      {suggestions.map((p) => (
                        <motion.button key={p._id} whileHover={{ x: 4 }}
                          onClick={() => { navigate(`/products/${p._id}`); onClose(); setSearchQuery(""); }}
                          className="w-full flex items-center p-2 text-left rounded-lg hover:bg-gray-50 transition-all">
                          <AiOutlineSearch className="w-4 h-4 text-gray-300 mr-3" />
                          <span className="text-gray-700 text-sm">{p.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  <div>
                    <div className="flex items-center mb-3">
                      <AiOutlineClockCircle className="w-4 h-4 text-gray-400 mr-2" />
                      <h3 className="text-[14px] md:text-[16px] font-medium text-gray-500 uppercase tracking-wider">Trending Now</h3>
                    </div>
                    {["Men's PowerFlex Tree", "Adidas Elite Shorts", "Endura Pants", "FlexCore Hoodie", "Xtreme Shirt"].map((search, i) => (
                      <motion.button key={i} whileHover={{ x: 4 }}
                        onClick={() => handleSuggestionClick(search, setSearchQuery, handleSearch)}
                        className="w-full flex items-center p-2 text-left rounded-lg hover:bg-gray-50 transition-all">
                        <BiTrendingUp className="w-4 h-4 text-red-400 mr-3" />
                        <span className="text-gray-700 text-[14px] md:text-[16px]">{search}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:block hidden p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Press Enter to search</span>
                <span>ESC to close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function handleSuggestionClick(suggestion, setSearchQuery, handleSearch) {
  setSearchQuery(suggestion)
  handleSearch(suggestion)
}
