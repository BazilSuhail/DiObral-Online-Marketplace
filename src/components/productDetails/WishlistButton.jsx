import { motion, useReducedMotion } from "motion/react"
import { FiHeart } from "react-icons/fi"

const EASE = [0.22, 1, 0.36, 1]

export default function WishlistButton({ active, onClick, className = "" }) {
  const reduce = useReducedMotion()
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`soft-icon-btn relative h-11 w-11 flex items-center justify-center ${active ? "text-red-600" : "text-gray-500 hover:text-red-600"} ${className}`}
    >
      {/* key on `active` remounts so the burst only plays on toggle */}
      <motion.span
        key={String(active)}
        className="flex"
        initial={reduce ? false : { scale: active ? 1 : 0.85 }}
        animate={reduce ? undefined : { scale: active ? [1, 1.35, 0.9, 1] : 1 }}
        transition={{ duration: 0.45 }}
      >
        <FiHeart className={`h-5 w-5 ${active ? "fill-current" : ""}`} />
      </motion.span>
      {active && !reduce && (
        <span key="burst" className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <motion.span
            className="absolute h-8 w-8 rounded-full ring-2 ring-red-600"
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4
            return (
              <motion.span
                key={i}
                className={`absolute h-1.5 w-1.5 rounded-full ${i % 2 ? "bg-gray-900" : "bg-red-600"}`}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: Math.cos(a) * 22, y: Math.sin(a) * 22, scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              />
            )
          })}
        </span>
      )}
    </button>
  )
}
