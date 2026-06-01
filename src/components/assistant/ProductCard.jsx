/* eslint-disable react/prop-types */
import { useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { FiCheck, FiPlus, FiLoader, FiStar, FiLayers, FiEye, FiSlash, FiTag } from "react-icons/fi"
import { API_BASE_URL } from "../../api/client"

const imageUrl = (image) =>
  !image ? "/placeholder.png" : image.startsWith("http") ? image : `${API_BASE_URL}/uploads/${image}`

export default function ProductCard({ product, onOpen, onAdd, onCompare, compared = false }) {
  const reduce = useReducedMotion()
  const sizes = product.size || []
  const shown = sizes.slice(0, 6)
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "")
  const [status, setStatus] = useState("idle") // idle | adding | added
  const [nudge, setNudge] = useState(!!product.needsSize)
  const chipRefs = useRef([])
  const price = product.sale > 0 ? Math.round(product.price - (product.price * product.sale) / 100) : product.price
  const outOfStock = product.stock !== undefined && product.stock < 1

  const add = async () => {
    if (!sizes.length) return onOpen(product) // size-less products are set up on their page
    if (!size) return setNudge(true)
    setStatus("adding")
    const ok = await onAdd(product, size)
    setStatus(ok ? "added" : "idle")
  }

  const pick = (s) => { setSize(s); setNudge(false) }

  // arrow keys move through the size radios (roving tabindex)
  const onSizeKey = (e) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const cur = Math.max(0, shown.indexOf(size))
    const next = (cur + dir + shown.length) % shown.length
    pick(shown[next])
    chipRefs.current[next]?.focus()
  }

  const ring = "focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 420, damping: 28 }}
      className="relative flex w-[164px] shrink-0 snap-start flex-col rounded-xl border border-white/70 bg-white/60 p-2 shadow-[0_8px_24px_-12px_rgba(17,24,39,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_16px_32px_-14px_rgba(220,38,38,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]"
    >
      <button type="button" onClick={() => onOpen(product)} className={`group rounded-lg text-left ${ring}`} aria-label={`Open ${product.name}`}>
        <div className="relative h-24 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-white/80">
          <img
            src={imageUrl(product.image)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.sale > 0 && (
            <span className="soft-badge soft-badge-sale absolute left-1.5 top-1.5 !px-1.5 !py-0.5 !text-[9px]">
              <FiTag className="h-2.5 w-2.5" />-{product.sale}%
            </span>
          )}
        </div>
        <p className="mt-1.5 min-h-[2lh] text-[11.5px] font-medium leading-snug text-gray-800 line-clamp-2">{product.name}</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[13px] font-semibold whitespace-nowrap text-red-600">Rs. {price?.toLocaleString()}</span>
          {product.sale > 0 && <span className="text-[10px] text-gray-400 line-through">{product.price?.toLocaleString()}</span>}
          {product.rating > 0 && (
            <span className="ml-auto flex items-center gap-0.5 text-[10px] text-gray-500">
              <FiStar className="h-2.5 w-2.5 fill-current text-red-500" />
              {Number(product.rating).toFixed(1)}
            </span>
          )}
        </div>
      </button>

      {onCompare && (
        <button
          type="button"
          onClick={() => onCompare(product)}
          aria-pressed={compared}
          aria-label={compared ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
          title="Compare"
          className={`absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-md border shadow-soft-xs backdrop-blur-sm transition-colors ${ring} ${
            compared ? "border-red-500 bg-red-600 text-white" : "border-white/80 bg-white/80 text-gray-500 hover:text-red-600"
          }`}
        >
          <FiLayers className="h-3.5 w-3.5" />
        </button>
      )}

      {sizes.length > 1 && (
        <div
          role="radiogroup"
          aria-label="Size"
          onKeyDown={onSizeKey}
          className={`mt-1.5 flex flex-wrap gap-1 rounded-lg ${nudge && !size ? "p-1 ring-1 ring-red-300 animate-pulse" : ""}`}
        >
          {shown.map((s, i) => (
            <button
              key={s}
              ref={(el) => { chipRefs.current[i] = el }}
              type="button"
              role="radio"
              aria-checked={size === s}
              tabIndex={size === s || (!size && i === 0) ? 0 : -1}
              onClick={() => pick(s)}
              className={`soft-chip !min-w-6 !justify-center !rounded-md !px-1.5 !py-0.5 !text-[10px] font-semibold ${ring} ${size === s ? "soft-chip-active" : "!bg-white/70"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {outOfStock ? (
        <span className="soft-badge soft-badge-neutral mt-2 h-8 w-full justify-center !rounded-lg">
          <FiSlash className="h-3 w-3" /> Out of stock
        </span>
      ) : (
        <button
          type="button"
          onClick={add}
          disabled={status === "adding"}
          className={`soft-btn soft-btn-sm mt-2 w-full !rounded-lg !text-[11px] disabled:opacity-60 ${ring} ${
            status === "added" ? "soft-btn-secondary" : "soft-btn-primary"
          }`}
        >
          {status === "adding" ? <FiLoader className="h-3.5 w-3.5 animate-spin" />
            : status === "added" ? <><FiCheck className="h-3.5 w-3.5" /> Added</>
              : !sizes.length ? <><FiEye className="h-3.5 w-3.5" /> View options</>
                : nudge && !size ? "Pick a size"
                  : <><FiPlus className="h-3.5 w-3.5" /> Add{size ? ` · ${size}` : ""}</>}
        </button>
      )}
    </motion.div>
  )
}
