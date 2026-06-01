import { useEffect, useRef, useState } from "react"
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react"
import {
  FiCheck, FiMinus, FiPlus, FiShoppingBag, FiAlertCircle, FiCalendar, FiTruck, FiX,
} from "react-icons/fi"
import { RulerSvg } from "./svgs"

const EASE = [0.22, 1, 0.36, 1]
const SPRING = { type: "spring", stiffness: 500, damping: 30 }
export const FREE_SHIPPING_THRESHOLD = 2000
const SHIPPING_FEE = 200

export const formatRs = (n) => `Rs. ${Number(n).toFixed(2)}`

/* ---------------- PriceBlock ---------------- */
export function PriceBlock({ price, displayPrice, hasSale, salePct, savings }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? displayPrice : displayPrice * 0.7)
  const mounted = useRef(false)

  useEffect(() => {
    if (reduce) { setShown(displayPrice); return }
    const from = mounted.current ? shown : displayPrice * 0.7
    mounted.current = true
    const controls = animate(from, displayPrice, { duration: 0.6, ease: EASE, onUpdate: setShown })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPrice, reduce])

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
      <span className={`text-3xl font-semibold tabular-nums ${hasSale ? "text-red-600" : "text-gray-900"}`}>
        {formatRs(shown)}
      </span>
      {hasSale && (
        <>
          <span className="text-base font-medium text-gray-400 line-through">{formatRs(price)}</span>
          <span className="soft-badge soft-badge-sale">Save {formatRs(savings)} ({salePct}%)</span>
        </>
      )}
    </div>
  )
}

/* ---------------- Size selector ---------------- */
const SIZE_TABLE = [
  ["S", "92", "66"], ["M", "98", "68"], ["L", "104", "70"], ["XL", "110", "72"],
]

function SizeGuidePopover({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="soft-card-inset mt-3 rounded-2xl p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Generic size guide (cm)</p>
        <button type="button" onClick={onClose} aria-label="Close size guide" className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:text-red-600">
          <FiX className="h-4 w-4" />
        </button>
      </div>
      <table className="w-full text-left text-xs text-gray-700">
        <thead>
          <tr className="text-gray-500">
            <th className="py-1 font-semibold">Size</th>
            <th className="py-1 font-semibold">Chest</th>
            <th className="py-1 font-semibold">Length</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_TABLE.map(([s, c, l]) => (
            <tr key={s} className="border-t border-gray-200">
              <td className="py-1.5 font-semibold text-gray-900">{s}</td>
              <td className="py-1.5">{c}</td>
              <td className="py-1.5">{l}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}

export function SizeSelector({ sizes, value, onChange, error, shakeKey = 0 }) {
  const reduce = useReducedMotion()
  const [guide, setGuide] = useState(false)
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Size: <span className="text-gray-900">{value || "Select"}</span>
        </span>
        <button
          type="button"
          onClick={() => setGuide((g) => !g)}
          aria-expanded={guide}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
        >
          <RulerSvg size={20} /> Size guide
        </button>
      </div>
      <motion.div
        key={shakeKey}
        role="radiogroup"
        aria-label="Size"
        animate={error && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap gap-2"
      >
        {sizes.map((s) => {
          const active = value === s
          return (
            <motion.button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              whileTap={reduce ? undefined : { scale: 0.92 }}
              onClick={() => onChange(s)}
              className={`relative flex h-12 min-w-12 items-center justify-center rounded-2xl px-3 text-sm font-semibold transition-colors ${
                active ? "text-white" : "soft-chip text-gray-700"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="size-pill"
                  transition={reduce ? { duration: 0 } : SPRING}
                  className="absolute inset-0 rounded-2xl bg-gray-900"
                />
              )}
              <span className="relative">{s}</span>
            </motion.button>
          )
        })}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600"
            role="alert"
          >
            <FiAlertCircle className="h-3.5 w-3.5" /> Please select a size
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence>{guide && <SizeGuidePopover onClose={() => setGuide(false)} />}</AnimatePresence>
    </div>
  )
}

/* ---------------- Quantity ---------------- */
export function QuantityStepper({ value, onChange, max, disabled }) {
  const reduce = useReducedMotion()
  const dir = useRef(1)
  const set = (n) => {
    dir.current = n > value ? 1 : -1
    onChange(n)
  }
  const minusOff = disabled || value <= 1
  const plusOff = disabled || value >= max
  return (
    <div className={`soft-card-inset flex h-14 items-center rounded-2xl p-1 ${disabled ? "opacity-60" : ""}`}>
      <button
        type="button" aria-label="Decrease quantity" disabled={minusOff} onClick={() => set(value - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-white disabled:opacity-40"
      >
        <FiMinus className="h-4 w-4" />
      </button>
      <div className="relative h-6 w-9 overflow-hidden text-center" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={reduce ? { opacity: 0 } : { y: `${dir.current * 100}%`, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: `${-dir.current * 100}%`, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
            className="absolute inset-0 text-sm font-semibold leading-6 text-gray-900"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <button
        type="button" aria-label="Increase quantity" disabled={plusOff} onClick={() => set(value + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-white disabled:opacity-40"
      >
        <FiPlus className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ---------------- Add to cart button ---------------- */
function Spinner() {
  return (
    <motion.svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 60" />
    </motion.svg>
  )
}

function DrawnCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <motion.path d="M4 12l5 5L20 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: EASE }} />
    </svg>
  )
}

export function AddToCartButton({ state = "idle", disabled, onClick, label = "Add to cart", compact, soldOut, className = "" }) {
  const reduce = useReducedMotion()
  const busy = state !== "idle"
  const bg = soldOut ? "#E5E7EB" : state === "added" ? "#111827" : "#DC2626"

  let content
  if (state === "adding") content = <><Spinner /> <span>Adding…</span></>
  else if (state === "added") content = <><DrawnCheck /> <span>Added to cart</span></>
  else if (state === "error") content = <><FiAlertCircle className="h-4 w-4" /> <span>Try again</span></>
  else content = <>{!soldOut && <FiShoppingBag className="h-4 w-4" />} <span>{soldOut ? "Out of stock" : label}</span></>

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      aria-disabled={disabled || busy}
      initial={false}
      animate={{
        backgroundColor: bg,
        x: state === "error" && !reduce ? [0, -8, 8, -5, 5, 0] : 0,
      }}
      transition={{ backgroundColor: { duration: reduce ? 0 : 0.3 }, x: { duration: 0.4 } }}
      whileTap={!disabled && !busy && !reduce ? { scale: 0.97 } : undefined}
      className={`flex items-center justify-center gap-2 rounded-2xl font-semibold ${
        compact ? "h-12 px-5 text-sm" : "h-14 flex-1 px-6 text-base"
      } ${
        soldOut
          ? "cursor-not-allowed bg-gray-200 text-gray-500"
          : "text-white shadow-lg shadow-red-600/25"
      } ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state + label + String(soldOut)}
          initial={{ opacity: 0, y: reduce ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -6 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
          className="inline-flex items-center gap-2 whitespace-nowrap"
        >
          {content}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

/* ---------------- Stock / shipping / delivery ---------------- */
export function StockNotice({ stock }) {
  if (stock <= 0) {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-gray-500">
        <span className="h-2 w-2 rounded-full bg-gray-400" /> Currently out of stock
      </p>
    )
  }
  if (stock <= 5) {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
        </span>
        Only {stock} left — order soon
      </p>
    )
  }
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      <span className="h-2 w-2 rounded-full bg-gray-400" /> In stock
    </p>
  )
}

export function ShippingProgress({ subtotal }) {
  const reduce = useReducedMotion()
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
  const unlocked = pct >= 100
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  return (
    <div className="soft-card-inset rounded-2xl p-4">
      <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={unlocked ? "ok" : "truck"}
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRING}
            className="flex text-red-600"
          >
            {unlocked ? <FiCheck className="h-4 w-4" /> : <FiTruck className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
        {unlocked ? "You've unlocked FREE delivery" : `Add ${formatRs(remaining)} more for FREE delivery`}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full bg-red-600"
          initial={{ width: reduce ? `${pct}%` : "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
        />
      </div>
      {!unlocked && <p className="mt-2 text-xs text-gray-500">Otherwise {formatRs(SHIPPING_FEE)} shipping</p>}
    </div>
  )
}

export function DeliveryEstimate() {
  const fmt = (offset) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
  }
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <span className="soft-icon-tile soft-icon-tile-sm"><FiCalendar className="h-4 w-4" /></span>
      <p>
        Arrives <span className="font-semibold text-gray-900">{fmt(3)} – {fmt(6)}</span>
      </p>
    </div>
  )
}

