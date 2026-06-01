/* eslint-disable react/prop-types */
import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { FiShoppingBag, FiArrowRight, FiShield, FiXCircle } from "react-icons/fi"
import { useCartStore } from "../../store/cartStore"
import { getCartItemPrice } from "../../lib/utils"

// Checkout always needs a real click from the user; the assistant can only show this card.
export default function ConfirmCard({ onConfirm, onDismiss }) {
  const cart = useCartStore((s) => s.cart)
  const reduce = useReducedMotion()
  const [dismissed, setDismissed] = useState(false)
  const count = cart.reduce((n, c) => n + (c.quantity || 1), 0)
  const total = cart.reduce((sum, c) => sum + getCartItemPrice(c).effectivePrice * (c.quantity || 1), 0)

  if (dismissed)
    return (
      <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
        <FiXCircle className="h-3 w-3" /> Checkout cancelled.
      </p>
    )

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.94 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 460, damping: 30 }}
      className="mt-2 max-w-[320px] rounded-xl border border-white/70 bg-white/60 p-3 shadow-[0_10px_28px_-12px_rgba(17,24,39,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md"
    >
      <div className="flex items-center gap-2.5 text-[12px] text-gray-700">
        <span className="soft-icon-tile soft-icon-tile-sm relative !rounded-lg">
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-lg ring-2 ring-red-300"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <FiShoppingBag className="relative h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-gray-800">
            {count} item{count === 1 ? "" : "s"} in cart
          </p>
          <p className="flex items-center gap-1 text-[10.5px] text-gray-400">
            <FiShield className="h-3 w-3" /> You confirm before paying
          </p>
        </div>
        <span className="ml-auto text-[13px] font-semibold whitespace-nowrap text-gray-900">Rs. {Math.round(total).toLocaleString()}</span>
      </div>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="soft-btn soft-btn-primary soft-btn-sm flex-1 !rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
        >
          Review & checkout <FiArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => { setDismissed(true); onDismiss?.() }}
          className="soft-btn soft-btn-ghost soft-btn-sm !rounded-lg !bg-white/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
        >
          Not now
        </button>
      </div>
    </motion.div>
  )
}
