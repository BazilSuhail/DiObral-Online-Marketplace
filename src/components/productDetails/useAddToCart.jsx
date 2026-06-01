import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react"
import { Link, useNavigate } from "react-router-dom"
import { FiCheck } from "react-icons/fi"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"

/** Imperative fly-to-cart: appends a clone to <body> (portal-like) and animates it to the cart button. */
export function flyToCart(imgSrc, fromRect) {
  if (typeof document === "undefined" || !fromRect) return
  const target = document.querySelector("[data-cart-target]")
  const tr = target?.getBoundingClientRect()
  const tx = tr && tr.width ? tr.left + tr.width / 2 : window.innerWidth - 48
  const ty = tr && tr.height ? tr.top + tr.height / 2 : 28
  const sx = fromRect.left + fromRect.width / 2
  const sy = fromRect.top + fromRect.height / 2
  const el = document.createElement("img")
  el.src = imgSrc
  el.alt = ""
  el.setAttribute("aria-hidden", "true")
  Object.assign(el.style, {
    position: "fixed", left: `${sx - 28}px`, top: `${sy - 28}px`, width: "56px", height: "56px",
    objectFit: "cover", borderRadius: "16px", zIndex: "9999", pointerEvents: "none",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  })
  document.body.appendChild(el)
  const dx = tx - sx
  const dy = ty - sy
  animate(
    el,
    { x: [0, dx * 0.4, dx], y: [0, dy - 120, dy], scale: [1, 0.8, 0.25], opacity: [1, 1, 0] },
    { duration: 0.75, times: [0, 0.45, 1], ease: [0.5, 0, 0.75, 0] },
  ).finished.finally(() => el.remove())
}

export function useAddToCart({ product, quantity, size, imageRef, imgSrc }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addToCart = useCartStore((s) => s.addToCart)
  const [state, setState] = useState("idle")
  const [sizeError, setSizeError] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [toast, setToast] = useState(false)
  const timers = useRef([])
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    const list = timers.current
    return () => { alive.current = false; list.forEach(clearTimeout) }
  }, [])

  const later = (fn, ms) => { timers.current.push(setTimeout(() => alive.current && fn(), ms)) }

  // clear the size error as soon as a size is chosen
  useEffect(() => { if (size) setSizeError(false) }, [size])

  const run = useCallback(async () => {
    if (!isAuthenticated) { navigate("/signin"); return }
    if (!product || state !== "idle") return
    if ((product.stock ?? 0) <= 0) return
    if (product.size?.length > 0 && !size) {
      setSizeError(true)
      setShakeKey((k) => k + 1)
      document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setState("adding")
    const ok = await addToCart({ id: product._id, quantity, size: size || undefined })
    if (!alive.current) return
    if (ok) {
      setState("added")
      if (!reduce && imageRef?.current) flyToCart(imgSrc, imageRef.current.getBoundingClientRect())
      setToast(true)
      later(() => setToast(false), 3000)
      later(() => setState("idle"), 1600)
    } else {
      setState("error")
      later(() => setState("idle"), 1600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, product, state, size, quantity, addToCart, navigate, imageRef, imgSrc])

  const toastNode = (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          role="status"
          className="fixed left-1/2 top-20 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          <FiCheck className="h-4 w-4" /> Added to cart
          <Link to="/cart" className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">View cart</Link>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return { state, run, sizeError, shakeKey, toastNode }
}
