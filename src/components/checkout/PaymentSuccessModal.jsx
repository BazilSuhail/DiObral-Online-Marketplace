import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { FiX, FiArrowRight, FiAlertTriangle, FiCheck } from "react-icons/fi"
import Button from "../ui/Button"

export default function PaymentSuccessModal({ isOpen, info, onClose }) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <FiCheck className="w-4 h-4" />
                </span>
                Payment Successful
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="px-5 py-6 flex flex-col items-center text-center">
              <SuccessSvg />
              <p className="text-gray-500 text-sm mt-4">
                Your {info.count > 0 ? `${info.count} package${info.count > 1 ? "s" : ""}` : "order"} of{" "}
                <span className="font-semibold text-gray-800">Rs. {info.total?.toFixed(2)}</span> is confirmed.
              </p>
              {info.groupOrderId && (
                <p className="text-xs text-gray-400 font-mono mt-2">Order #{info.groupOrderId.slice(0, 8)}</p>
              )}

              <div className="mt-5 w-full rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-xs text-yellow-800 flex items-start gap-2 text-left">
                <FiAlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  This is a <strong>dummy/test payment</strong> (test mode) — but your order is real and will be
                  processed normally.
                </span>
              </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <Button onClick={onClose} variant="red" className="w-full justify-center">
                View My Orders <FiArrowRight className="ml-2 inline" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SuccessSvg() {
  return (
    <svg className="w-24 h-24 mx-auto" viewBox="0 0 52 52">
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="#16a34a"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      />
      <motion.path
        fill="none"
        stroke="#16a34a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 27 l8 8 l16 -16"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
      />
    </svg>
  )
}
