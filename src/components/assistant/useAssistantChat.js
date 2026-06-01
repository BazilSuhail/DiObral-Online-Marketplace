import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { apiCall } from "../../api/client"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"
import { runActions } from "../../lib/assistantActions"

// Conversation state + talking to POST /assistant. No UI here.
// Message shapes:
//   { id, ts, role: "user", text }
//   { id, ts, role: "assistant", text, speech, products, pageUrl, confirm, suggestions, error, feedback }
//   { id, ts, role: "note", text, ok }           <- confirmations of what really happened

const STORAGE_KEY = "diobral-assistant-v3"
const OLD_KEY = "diobral-assistant-v2"
const RECENT_KEY = "diobral-assistant-recent"
const TTL = 7 * 24 * 3600 * 1000
const KEEP = 60
const STAGES = [
  [0, "Reading your message…"],
  [700, "Searching the catalog…"],
  [1800, "Checking sizes & prices…"],
  [4000, "Almost there…"],
]
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (saved && Array.isArray(saved.messages) && Date.now() - (saved.savedAt || 0) < TTL) return saved.messages
      return []
    }
    // one-time migration from the v2 session key
    const old = JSON.parse(sessionStorage.getItem(OLD_KEY) || "[]")
    sessionStorage.removeItem(OLD_KEY)
    return Array.isArray(old) ? old.slice(-KEEP) : []
  } catch {
    return []
  }
}

function loadRecent() {
  try {
    const r = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
    return Array.isArray(r) ? r.slice(0, 5) : []
  } catch {
    return []
  }
}

// What the server sees of the past: words, plus which products were on screen so "the second one" resolves.
function toHistory(messages) {
  return messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && !m.error && m.text)
    .slice(-10)
    .map((m) => ({
      role: m.role,
      content: (m.products?.length
        ? `${m.text}\n[shown: ${m.products.slice(0, 8).map((p, i) => `${i + 1}. ${p.name} (${p._id})`).join("; ")}]`
        : m.text
      ).slice(0, 1200),
    }))
}

function routeLabel(route) {
  const p = String(route).split("?")[0]
  if (p === "/cart") return "Cart"
  if (p === "/checkout") return "Checkout"
  if (p.startsWith("/orders")) return "Orders"
  if (p === "/wishlist") return "Wishlist"
  if (p.startsWith("/productlist")) return "Products"
  if (p.startsWith("/products/")) return "Product"
  return null
}

function noteFor(r) {
  if (r.type === "add_to_cart") {
    return {
      role: "note",
      ok: r.ok,
      text: r.ok
        ? `Added ${r.quantity > 1 ? `${r.quantity} × ` : ""}${r.name} (${r.size}) to your cart`
        : `Couldn't add ${r.name}. Please try again.`,
    }
  }
  if (r.type === "navigate" && r.route) {
    const label = routeLabel(r.route)
    return label ? { role: "note", ok: true, text: `Opened ${label}` } : null
  }
  return null
}

export function useAssistantChat({ onReply, onNavigate } = {}) {
  const [messages, setMessages] = useState(loadMessages)
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState("")
  const [compareItems, setCompareItems] = useState([])
  const [recent, setRecent] = useState(loadRecent)
  const [lastActiveAt] = useState(() => loadMessages().at(-1)?.ts || 0)

  const messagesRef = useRef(messages)
  const loadingRef = useRef(false)
  const abortRef = useRef(null)
  const lastProductRef = useRef(null)
  const stageTimers = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const cartCount = useCartStore((s) => s.cart.length)
  const addToCart = useCartStore((s) => s.addToCart)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // everything the stable callbacks need, refreshed each render
  const live = useRef({})
  live.current = { onReply, onNavigate, navigate, pathname: location.pathname, cartCount, addToCart, isAuthenticated }
  messagesRef.current = messages

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), messages: messages.slice(-KEEP) }))
      } catch {
        /* storage full or blocked */
      }
    }, 300)
    return () => clearTimeout(t)
  }, [messages])

  useEffect(() => {
    if (isAuthenticated) useCartStore.getState().fetchCart()
  }, [isAuthenticated])

  const clearStages = useCallback(() => {
    stageTimers.current.forEach(clearTimeout)
    stageTimers.current = []
  }, [])

  useEffect(
    () => () => {
      abortRef.current?.abort()
      clearStages()
    },
    [clearStages]
  )

  const push = useCallback((...items) => {
    const made = items.map((x) => ({ id: uid(), ts: Date.now(), ...x }))
    setMessages((m) => [...m, ...made])
    return made
  }, [])

  const startLoading = useCallback(() => {
    loadingRef.current = true
    setLoading(true)
    clearStages()
    setStage(STAGES[0][1])
    STAGES.slice(1).forEach(([ms, label]) => stageTimers.current.push(setTimeout(() => setStage(label), ms)))
  }, [clearStages])

  const stopLoading = useCallback(() => {
    loadingRef.current = false
    setLoading(false)
    clearStages()
    setStage("")
  }, [clearStages])

  const writeRecent = (next) => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
    return next
  }

  const remember = useCallback((text) => {
    setRecent((r) => writeRecent([text, ...r.filter((x) => x.toLowerCase() !== text.toLowerCase())].slice(0, 5)))
  }, [])

  const removeRecent = useCallback((text) => {
    setRecent((r) => writeRecent(r.filter((x) => x !== text)))
  }, [])

  const send = useCallback(
    async (raw) => {
      const text = String(raw || "").trim()
      if (!text || loadingRef.current) return
      const { pathname, cartCount, navigate, addToCart } = live.current
      const current = messagesRef.current

      const visible = [...current].reverse().find((m) => m.products?.length)?.products || []
      const productOnPage = /^\/products\/([a-fA-F0-9]{24})/.exec(pathname)?.[1]
      const context = {
        path: pathname,
        cartCount,
        lastProductId: productOnPage || lastProductRef.current,
        visibleProducts: visible.slice(0, 8).map((p) => ({ _id: p._id, name: p.name, price: p.price, size: p.size || [] })),
      }
      const history = toHistory(current)

      push({ role: "user", text })
      remember(text)
      startLoading()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await apiCall("/assistant", "POST", { message: text, history, context }, { signal: controller.signal })
        if (controller.signal.aborted) return
        const actions = res.actions || []
        const [reply] = push({
          role: "assistant",
          text: res.reply,
          speech: res.speech || res.reply,
          products: res.products || [],
          pageUrl: actions.find((a) => a.type === "render_products")?.pageUrl,
          confirm: actions.some((a) => a.type === "confirm_checkout"),
          suggestions: res.suggestions || [],
        })
        live.current.onReply?.(reply)

        const results = await runActions(actions, {
          navigate,
          addToCart,
          signal: controller.signal,
          from: pathname,
          onNavigate: () => live.current.onNavigate?.(),
        })
        if (controller.signal.aborted) return
        const notes = results.map(noteFor).filter(Boolean)
        if (notes.length) push(...notes)
      } catch (err) {
        if (controller.signal.aborted) return
        const msg = err.response?.data?.reply || "I couldn't reach the store just now. Please try again."
        const [reply] = push({ role: "assistant", text: msg, speech: msg, error: true })
        live.current.onReply?.(reply)
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
          stopLoading()
        }
      }
    },
    [push, remember, startLoading, stopLoading]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    stopLoading()
  }, [stopLoading])

  // Drop the user turn that produced this assistant message (and everything after), then ask again.
  const resendFrom = useCallback(
    (assistantId) => {
      if (loadingRef.current) return
      const list = messagesRef.current
      const idx = list.findIndex((m) => m.id === assistantId)
      if (idx < 0) return
      let u = idx - 1
      while (u >= 0 && list[u].role !== "user") u--
      if (u < 0) return
      const text = list[u].text
      const kept = list.slice(0, u)
      messagesRef.current = kept
      setMessages(kept)
      send(text)
    },
    [send]
  )

  const retry = useCallback((id) => resendFrom(id), [resendFrom])

  const regenerate = useCallback(() => {
    const last = [...messagesRef.current].reverse().find((m) => m.role === "assistant" && !m.error)
    if (last) resendFrom(last.id)
  }, [resendFrom])

  const setFeedback = useCallback((id, value) => {
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, feedback: value || undefined } : m)))
  }, [])

  // Size picked / Add tapped on a product card.
  const addProduct = useCallback(
    async (product, size) => {
      const { isAuthenticated, addToCart, navigate, pathname } = live.current
      if (!isAuthenticated) {
        navigate("/signin", { state: { from: pathname } })
        return false
      }
      const ok = await addToCart({ id: product._id, quantity: 1, size })
      push(noteFor({ type: "add_to_cart", ok, name: product.name, size, quantity: 1 }))
      return ok
    },
    [push]
  )

  const openProduct = useCallback((product) => {
    lastProductRef.current = product._id
    live.current.navigate(`/products/${product._id}`)
    live.current.onNavigate?.()
  }, [])

  const goTo = useCallback((route) => {
    live.current.navigate(route)
    live.current.onNavigate?.()
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    stopLoading()
    messagesRef.current = []
    setMessages([])
    setCompareItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [stopLoading])

  // A local assistant message (no server call), used for the welcome and /help.
  const greet = useCallback((msg) => push({ role: "assistant", products: [], suggestions: [], ...msg }), [push])

  const toggle = useCallback((p) => {
    setCompareItems((items) =>
      items.some((x) => x._id === p._id) ? items.filter((x) => x._id !== p._id) : items.length >= 3 ? items : [...items, p]
    )
  }, [])
  const clear = useCallback(() => setCompareItems([]), [])

  return {
    messages, loading, stage, send, retry, regenerate, stop, addProduct, openProduct, goTo, reset, greet,
    setFeedback, compare: { items: compareItems, toggle, clear }, recent, removeRecent, lastActiveAt,
  }
}
