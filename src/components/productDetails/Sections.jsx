import { useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Link } from "react-router-dom"
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiChevronDown, FiMaximize2, FiPackage } from "react-icons/fi"
import { ShieldSvg, ReturnsSvg, TruckSvg } from "./svgs"
import { AddToCartButton, formatRs } from "./PurchaseParts"
import StarRating from "./StarRating"

const EASE = [0.22, 1, 0.36, 1]
const SPRING = { type: "spring", stiffness: 400, damping: 36 }

/* ---------------- Store ---------------- */
export function StoreCard({ store }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-lg font-semibold text-white">
        {(store?.storeName || "D").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sold by</p>
        <p className="truncate text-sm font-semibold text-gray-900">{store?.storeName || "DiObral Marketplace"}</p>
      </div>
      {store?.slug && (
        <Link
          to={`/stores/${store.slug}`}
          className="soft-btn soft-btn-ghost soft-btn-sm min-h-[44px] shrink-0"
        >
          Visit store <FiArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

/* ---------------- Trust ---------------- */
export function TrustGrid() {
  const items = [
    { Svg: ShieldSvg, label: "Secure checkout" },
    { Svg: ReturnsSvg, label: "Easy 7-day returns" },
    { Svg: TruckSvg, label: "Fast delivery" },
  ]
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {items.map(({ Svg, label }) => (
        <div key={label} className="flex flex-col items-center gap-1.5 text-center">
          <Svg size={32} className="sm:hidden" />
          <Svg size={40} className="hidden sm:block" />
          <p className="text-[11px] font-medium leading-snug text-gray-700 sm:text-xs">{label}</p>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Accordion ---------------- */
function Panel({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const reduce = useReducedMotion()
  return (
    <div className="border-t border-gray-200 first:border-t-0">
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex min-h-[56px] w-full items-center justify-between gap-3 text-left text-sm font-semibold text-gray-900"
      >
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.25 }} className="flex text-gray-500">
          <FiChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm leading-relaxed text-gray-600">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DetailsAccordion({ description, onOpenModal }) {
  const has = typeof description === "string" && description.trim()
  return (
    <div>
      {has && (
        <Panel title="Description" defaultOpen>
          <p className="whitespace-pre-wrap">{description}</p>
          <button type="button" onClick={onOpenModal} className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700">
            <FiMaximize2 className="h-3.5 w-3.5" /> Open full details
          </button>
        </Panel>
      )}
      <Panel title="Shipping & Returns" defaultOpen={!has}>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Free delivery on orders over Rs. 2000, otherwise Rs. 200 flat shipping.</li>
          <li>Estimated delivery is 3 to 6 days from the order date.</li>
          <li>Easy 7-day returns on unused items in original packaging.</li>
        </ul>
      </Panel>
    </div>
  )
}

/* ---------------- Related ---------------- */
export function RelatedCarousel({ items, toUrl }) {
  const ref = useRef(null)
  const scroll = (d) => {
    const el = ref.current
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: "smooth" })
  }
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="soft-section-title text-xl font-semibold text-gray-900">
          <span className="soft-icon-tile soft-icon-tile-sm"><FiPackage className="h-4 w-4" /></span>
          You might also like
        </h2>
        <div className="flex items-center gap-2">
          <Link to="/productlist/all" className="mr-1 hidden items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 sm:inline-flex">
            Explore all <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button type="button" aria-label="Previous" onClick={() => scroll(-1)} className="soft-icon-btn flex h-10 w-10 items-center justify-center text-gray-700"><FiChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Next" onClick={() => scroll(1)} className="soft-icon-btn flex h-10 w-10 items-center justify-center text-gray-700"><FiChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
      <div ref={ref} className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((rp) => {
          const p = rp.price ?? 0
          const pct = rp.sale ?? 0
          const sale = pct > 0 && pct < 100
          const now = sale ? p * (1 - pct / 100) : p
          return (
            <Link key={rp._id} to={`/products/${rp._id}`} className="group w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]">
              <motion.div whileHover={{ y: -4 }} className="soft-card soft-card-hover overflow-hidden rounded-3xl">
                <div className="relative aspect-4/5 overflow-hidden bg-gray-200">
                  <img src={toUrl(rp.image)} alt={rp.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {sale && <span className="soft-badge soft-badge-sale absolute left-2 top-2">-{pct}%</span>}
                </div>
                <div className="space-y-1 p-3.5">
                  <p className="truncate text-sm font-semibold text-gray-900">{rp.name}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-sm font-semibold ${sale ? "text-red-600" : "text-gray-900"}`}>{formatRs(now)}</span>
                    {sale && <span className="text-xs text-gray-400 line-through">{formatRs(p)}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <StarRating rating={rp.rating || 0} size="w-3 h-3" />
                    <span className="text-[10px] text-gray-400">({rp.totalReviews || 0})</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- Sticky bar ---------------- */
export function StickyCartBar({ visible, name, imgSrc, displayPrice, size, state, onAdd, disabled, soldOut, label }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: "110%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "110%" }}
          transition={reduce ? { duration: 0.15 } : SPRING}
          className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <img src={imgSrc} alt="" className="h-12 w-12 shrink-0 rounded-2xl bg-gray-200 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                {formatRs(displayPrice)}
                {size && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">Size {size}</span>}
              </p>
            </div>
            <AddToCartButton compact state={state} onClick={onAdd} disabled={disabled} soldOut={soldOut} label={label} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

