import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion, useMotionValue, useSpring, useReducedMotion } from "motion/react"
import { FiChevronLeft, FiChevronRight, FiShare2, FiZoomIn, FiTag, FiCheck } from "react-icons/fi"
import WishlistButton from "./WishlistButton"

const EASE = [0.22, 1, 0.36, 1]
const SPRING = { type: "spring", stiffness: 500, damping: 30 }

export default function Gallery({
  images, name, hasSale, salePct, wishlisted, onToggleWishlist, onShare, copied, imageRef,
}) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [hovering, setHovering] = useState(false)
  const [hinted, setHinted] = useState(false)
  const [fine, setFine] = useState(false)
  const localRef = useRef(null)
  const wrapRef = imageRef || localRef
  const lx = useMotionValue(0)
  const ly = useMotionValue(0)
  const sx = useSpring(lx, { stiffness: 400, damping: 40 })
  const sy = useSpring(ly, { stiffness: 400, damping: 40 })
  const count = images.length
  const multi = count > 1

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(pointer: fine)")
    const update = () => setFine(mq.matches)
    update()
    mq.addEventListener?.("change", update)
    return () => mq.removeEventListener?.("change", update)
  }, [])

  const go = (next, d) => {
    setDir(d)
    setIndex(((next % count) + count) % count)
  }
  const next = () => go(index + 1, 1)
  const prev = () => go(index - 1, -1)
  const lensOn = fine && !reduce

  const onMove = (e) => {
    if (!lensOn) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    lx.set(x - 60)
    ly.set(y - 60)
    e.currentTarget.style.setProperty("--x", `${(x / r.width) * 100}%`)
    e.currentTarget.style.setProperty("--y", `${(y / r.height) * 100}%`)
  }

  const src = images[index]

  return (
    <div className="flex gap-4 lg:flex-row">
      {/* Thumb rail (desktop) */}
      {multi && (
        <div className="hidden lg:flex flex-col gap-3 w-20 shrink-0 max-h-[34rem] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-1 -mx-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => go(i, i > index ? 1 : -1)}
              className={`relative aspect-4/5 w-full shrink-0 overflow-hidden rounded-2xl bg-gray-200 ${i === index ? "" : "opacity-70 hover:opacity-100"} transition-opacity`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
              {i === index && (
                <motion.span
                  layoutId="thumb-ring"
                  transition={reduce ? { duration: 0 } : SPRING}
                  className="absolute inset-0 rounded-2xl ring-2 ring-red-600"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div
          ref={wrapRef}
          onPointerEnter={() => { if (lensOn) { setHovering(true); setHinted(true) } }}
          onPointerLeave={() => setHovering(false)}
          onPointerMove={onMove}
          className="relative aspect-4/5 w-full overflow-hidden bg-gray-200 rounded-b-3xl lg:rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
          style={{ touchAction: multi ? "pan-y" : undefined }}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.img
              key={index}
              src={src}
              alt={`${name} - image ${index + 1}`}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover select-none"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.02, x: dir * 24 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.2 } }}
              transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
              drag={multi && !lensOn ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60 || info.velocity.x < -400) next()
                else if (info.offset.x > 60 || info.velocity.x > 400) prev()
              }}
            />
          </AnimatePresence>

          {/* Zoom overlay + lens ring */}
          {lensOn && (
            <>
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
                initial={false}
                animate={{ opacity: hovering ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ transform: "scale(2.2)", transformOrigin: "var(--x, 50%) var(--y, 50%)" }}
                />
              </motion.div>
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 h-[120px] w-[120px] rounded-full ring-2 ring-white/80 shadow-xl"
                style={{ x: sx, y: sy }}
                initial={false}
                animate={{ opacity: hovering ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </>
          )}

          {/* Sale badge */}
          {hasSale && (
            <div className="absolute left-3 top-3 sm:left-4 sm:top-4 z-10">
              <motion.span
                animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
                transition={{ duration: 0.8, repeat: 2, delay: 0.6 }}
                className="soft-badge soft-badge-sale inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
              >
                <FiTag className="h-3 w-3" /> {salePct}% OFF
              </motion.span>
            </div>
          )}

          {/* Wishlist + share */}
          <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 flex flex-col gap-2">
            <WishlistButton active={wishlisted} onClick={onToggleWishlist} />
            <button
              type="button"
              onClick={onShare}
              aria-label="Copy product link"
              className="soft-icon-btn h-11 w-11 flex items-center justify-center text-gray-500 hover:text-red-600"
            >
              {copied ? <FiCheck className="h-5 w-5 text-red-600" /> : <FiShare2 className="h-5 w-5" />}
            </button>
          </div>

          {/* Arrows (desktop, always visible) */}
          {multi && (
            <>
              <button
                type="button" onClick={prev} aria-label="Previous image"
                className="soft-icon-btn hidden lg:flex absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 items-center justify-center text-gray-700"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button" onClick={next} aria-label="Next image"
                className="soft-icon-btn hidden lg:flex absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 items-center justify-center text-gray-700"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-soft-xs">
                {index + 1} / {count}
              </span>
            </>
          )}

          {/* Hover hint (desktop) */}
          <AnimatePresence>
            {lensOn && !hinted && (
              <motion.span
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute bottom-4 left-4 z-10 hidden lg:inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-gray-700 shadow-soft-xs"
              >
                <FiZoomIn className="h-3.5 w-3.5" /> Hover to zoom
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Dots (mobile) */}
        {multi && (
          <div className="mt-3 flex items-center justify-center gap-1.5 lg:hidden">
            {images.map((_, i) => (
              <button
                key={i} type="button" aria-label={`Go to image ${i + 1}`}
                onClick={() => go(i, i > index ? 1 : -1)}
                className="relative flex h-6 items-center justify-center px-0.5"
              >
                <span className="block h-1.5 w-1.5 rounded-full bg-gray-300" />
                {i === index && (
                  <motion.span
                    layoutId="dot"
                    transition={reduce ? { duration: 0 } : SPRING}
                    className="absolute h-1.5 w-5 rounded-full bg-red-600"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
