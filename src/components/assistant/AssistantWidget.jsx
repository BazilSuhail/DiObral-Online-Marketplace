import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiArrowRight,
  FiShoppingBag,
  FiLoader,
  FiMic,
  FiType,
} from "react-icons/fi"
import { post, API_BASE_URL } from "../../api/client"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"
import { runActions } from "../../lib/assistantActions"
import PlasmaRing from "./PlasmaRing"

const SUGGESTIONS = [
  "Show me pants under 300",
  "Add this to cart",
  "Move to checkout",
  "Confirm my order",
]

// Ring colours: dark red -> rose
const RING_COLORS = ["#7F1D1D", "#991B1B", "#E11D48", "#F43F5E"]

// Each assistant phase drives different ring values
const RING_PHASES = {
  listening: { speed: 130, waveHeight: 30, scale: 44, density: 120 },
  thinking: { speed: 260, waveHeight: 48, scale: 48, density: 150 },
  speaking: { speed: 90, waveHeight: 18, scale: 38, density: 90 },
  result: { speed: 55, waveHeight: 10, scale: 40, density: 95 },
}

const RING_LABELS = {
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking...",
  result: "Done",
}

const MESSAGES_KEY = "diobral-assistant-messages"

function buildImageUrl(image) {
  if (!image) return "/placeholder.png"
  if (image.startsWith("http")) return image
  return `${API_BASE_URL}/uploads/${image}`
}

// Web Speech API (Chrome/Edge/Safari) - null where unsupported
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState("text") // "text" | "voice"
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastProductId, setLastProductId] = useState(null)
  const [lastProducts, setLastProducts] = useState([])
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [ringPhase, setRingPhase] = useState(null) // "listening" | "thinking" | "speaking" | "result"

  const navigate = useNavigate()
  const location = useLocation()
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const recogRef = useRef(null)
  const ringTimer = useRef(null)
  const openRef = useRef(false)
  const synthUtteranceRef = useRef(null)

  const cart = useCartStore((s) => s.cart)
  const addToCart = useCartStore((s) => s.addToCart)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const hidden = ["/signin", "/signup"].includes(location.pathname)

  // Load messages from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(MESSAGES_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setMessages(parsed)
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  // Persist messages to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
    } catch {
      // storage full or unavailable
    }
  }, [messages])

  useEffect(() => {
    if (isAuthenticated) useCartStore.getState().fetchCart()
  }, [isAuthenticated])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading, ringPhase])

  useEffect(() => {
    openRef.current = open
  }, [open])

  // Track speaking state via SpeechSynthesis
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return

    const checkSpeaking = () => {
      if (synth.speaking && !synth.paused) {
        if (!speaking) setSpeaking(true)
        if (ringPhase !== "speaking" && ringPhase !== "thinking") {
          setRingPhase("speaking")
        }
      } else if (speaking && !synth.speaking) {
        setSpeaking(false)
        if (ringPhase === "speaking") {
          setRingPhase(null)
        }
      }
    }

    const interval = setInterval(checkSpeaking, 200)
    return () => clearInterval(interval)
  }, [speaking, ringPhase])

  // Warm up voice list (Chrome loads it async) + cleanup on unmount
  useEffect(() => {
    window.speechSynthesis?.getVoices()
    return () => {
      window.speechSynthesis?.cancel()
      clearTimeout(ringTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") close() }
    document.addEventListener("keydown", onKey)
    if (mode === "text") {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    return () => document.removeEventListener("keydown", onKey)
  }, [open, mode])

  const hideRingSoon = (ms = 2400) => {
    clearTimeout(ringTimer.current)
    ringTimer.current = setTimeout(() => {
      if (openRef.current) setRingPhase(null)
    }, ms)
  }

  // Speak replies with a British (en-GB) voice when one is available
  const speak = (text) => {
    const synth = window.speechSynthesis
    if (!synth || !text || !openRef.current) return
    synth.cancel()

    const start = () => {
      const voices = synth.getVoices()
      const voice =
        voices.find((v) => v.lang === "en-GB") ||
        voices.find((v) => /en[-_]GB/i.test(v.lang || "")) ||
        voices.find((v) => /daniel|google uk english|serena|kate|sonia|libby/i.test(v.name || "")) ||
        voices.find((v) => /^en/i.test(v.lang || "")) ||
        null
      const u = new SpeechSynthesisUtterance(text)
      if (voice) u.voice = voice
      u.lang = "en-GB"
      u.rate = 1
      u.pitch = 1

      u.onstart = () => {
        setSpeaking(true)
        setRingPhase("speaking")
      }
      u.onend = () => {
        setSpeaking(false)
        synthUtteranceRef.current = null
        hideRingSoon(1200)
      }
      u.onerror = () => {
        setSpeaking(false)
        synthUtteranceRef.current = null
        hideRingSoon(800)
      }

      synthUtteranceRef.current = u
      synth.speak(u)
    }

    if (synth.getVoices().length) start()
    else {
      const onVoices = () => {
        synth.removeEventListener("voiceschanged", onVoices)
        start()
      }
      synth.addEventListener("voiceschanged", onVoices)
    }
  }

  const stopListening = () => {
    try {
      recogRef.current?.abort?.()
    } catch {
      /* already stopped */
    }
    recogRef.current = null
    setListening(false)
  }

  const close = () => {
    stopListening()
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    clearTimeout(ringTimer.current)
    setRingPhase(null)
    setOpen(false)
    // Do NOT clear messages - they persist in sessionStorage and state
  }

  // Alias: close and hardClose are the same now - history is always preserved
  const hardClose = close

  useEffect(() => () => recogRef.current?.abort?.(), [])

  const productIdFromPath = () => {
    const m = /^\/products\/([a-fA-F0-9]{24})/.exec(location.pathname)
    return m ? m[1] : lastProductId
  }

  const send = async (rawText) => {
    const text = (rawText ?? input).trim()
    if (!text || loading) return
    setInput("")
    stopListening()

    const context = {
      path: location.pathname,
      cartCount: cart.length,
      isAuthenticated,
      lastProductId: productIdFromPath(),
      visibleProducts: lastProducts.slice(0, 8).map((p) => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        size: p.size || [],
      })),
    }
    setMessages((m) => [...m, { role: "user", content: text }])
    setLoading(true)
    setRingPhase("thinking")

    try {
      const res = await post("/assistant", { message: text, context })

      const pageUrl = res.actions?.find((a) => a.type === "render_products")?.pageUrl
      const products = res.products || []

      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.reply, products, pageUrl },
      ])
      if (products.length) setLastProducts(products)

      if (openRef.current) {
        setRingPhase("result")
        hideRingSoon(2600)
        if (res.reply) speak(res.reply)
      }

      // Modal stays open during navigation/checkout/auth
      await runActions(res.actions, {
        navigate,
        addToCart,
      })
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: err.response?.data?.reply || err.response?.data?.error || "Sorry, I could not process that.",
        },
      ])
      if (openRef.current) {
        setRingPhase("result")
        hideRingSoon(1600)
      }
    } finally {
      setLoading(false)
    }
  }

  // Voice mode: toggle listening
  const toggleVoice = () => {
    if (!SpeechRecognition) return
    if (listening) {
      stopListening()
      setRingPhase((p) => (p === "listening" ? null : p))
      return
    }

    window.speechSynthesis?.cancel()
    setSpeaking(false)
    clearTimeout(ringTimer.current)

    const rec = new SpeechRecognition()
    rec.lang = "en-US"
    rec.interimResults = true
    rec.continuous = false

    rec.onresult = (event) => {
      let transcript = ""
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInput(transcript)

      const final = event.results[event.results.length - 1]
      if (final.isFinal) {
        const text = transcript.trim()
        rec.onend = null
        rec.onerror = null
        stopListening()
        if (text) send(text)
        else setRingPhase((p) => (p === "listening" ? null : p))
      }
    }
    rec.onend = () => {
      recogRef.current = null
      setListening(false)
      setRingPhase((p) => (p === "listening" ? null : p))
    }
    rec.onerror = () => {
      rec.onend = null
      recogRef.current = null
      setListening(false)
      setRingPhase((p) => (p === "listening" ? null : p))
    }

    try {
      rec.start()
      recogRef.current = rec
      setListening(true)
      setRingPhase("listening")
    } catch {
      setListening(false)
      setRingPhase(null)
    }
  }

  const toggleMode = () => {
    const next = mode === "text" ? "voice" : "text"
    setMode(next)
    stopListening()
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setRingPhase(null)
    setInput("")
  }

  const openProduct = (product) => {
    setLastProductId(product._id)
    // Don't close the modal - just navigate
    navigate(`/products/${product._id}`)
  }

  const renderProduct = (product) => {
    const price = product.sale > 0 ? product.price - (product.price * product.sale) / 100 : product.price
    return (
      <button
        key={product._id}
        onClick={() => openProduct(product)}
        className="text-left border border-gray-200 rounded-xl p-2 hover:border-red-300 hover:shadow-sm transition-all bg-white"
      >
        <img
          src={buildImageUrl(product.image)}
          alt={product.name}
          className="w-full h-20 object-cover rounded-lg bg-gray-50 mb-2"
        />
        <p className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-tight">{product.name}</p>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-[13px] font-bold text-red-700">Rs. {price.toFixed(0)}</span>
          {product.sale > 0 && (
            <span className="text-[10px] text-gray-400 line-through">Rs. {product.price}</span>
          )}
        </div>
      </button>
    )
  }

  const onSubmit = (e) => {
    e.preventDefault()
    send()
  }

  // Query shown beneath the ring: live transcript while listening, else the last thing asked
  const lastUserQuery = [...messages].reverse().find((m) => m.role === "user")?.content || ""
  const ringQuery = ringPhase === "listening" ? input.trim() : lastUserQuery

  // Compact modal dimensions
  const modalClass = mode === "voice"
    ? "w-[92vw] h-[68vh] sm:w-[380px] sm:h-[520px] max-h-[520px]"
    : "w-[92vw] h-[78vh] sm:w-[420px] sm:h-[640px] max-h-[640px]"

  if (hidden) return null

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => (open ? hardClose() : setOpen(true))}
        aria-label="Shopping assistant"
        className="fixed bottom-5 right-5 z-[45] h-12 w-12 rounded-full bg-red-700 text-white shadow-lg shadow-red-700/30 flex items-center justify-center hover:bg-red-800 transition-colors"
      >
        {open ? <FiX className="w-5 h-5" /> : <FiMessageCircle className="w-5 h-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-[45] flex items-center justify-center p-2 sm:p-4"
          >
            {/* Backdrop - clicking backdrop closes the modal */}
            <button
              aria-label="Close assistant"
              onClick={hardClose}
              className="absolute inset-0 bg-black/40 cursor-default"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className={`relative ${modalClass} bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden`}
            >
            {/* Header - compact */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiShoppingBag className="w-3.5 h-3.5 text-gray-700" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold leading-tight text-gray-900">DiObral Assistant</p>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {ringPhase ? RING_LABELS[ringPhase] : "Ask anything"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Mode toggle */}
                <button
                  onClick={toggleMode}
                  aria-label={mode === "text" ? "Switch to voice mode" : "Switch to text mode"}
                  title={mode === "text" ? "Voice mode" : "Text mode"}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  {mode === "text" ? <FiMic className="w-3.5 h-3.5" /> : <FiType className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={hardClose}
                  aria-label="Close"
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages - compact, scrollable */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50/50">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-3 py-2 text-[13px] text-gray-700">
                    Hi! I can find products, add them to your cart and take you to checkout. What are you
                    looking for?
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:text-red-700 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "bg-red-700 text-white rounded-xl rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-xl rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {m.products?.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        {m.products.map(renderProduct)}
                      </div>
                    )}

                    {m.pageUrl && m.products?.length > 0 && (
                      <button
                        onClick={() => { navigate(m.pageUrl) }}
                        className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-700 hover:text-red-800"
                      >
                        View all results <FiArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-3 py-2">
                    <FiLoader className="w-3.5 h-3.5 text-red-600 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Compact phase bar - shows ring + status below messages */}
            {ringPhase && (
              <div className="shrink-0 border-t border-gray-200 bg-white/95 px-3 py-2 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0">
                  <PlasmaRing
                    background="#ffffff"
                    colors={RING_COLORS}
                    density={RING_PHASES[ringPhase].density}
                    speed={RING_PHASES[ringPhase].speed}
                    waveHeight={RING_PHASES[ringPhase].waveHeight}
                    scale={RING_PHASES[ringPhase].scale}
                    style={{ minWidth: 0, minHeight: 0, pointerEvents: "none" }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {ringQuery && (
                    <p className="text-[12px] font-semibold text-gray-900 truncate">
                      &ldquo;{ringQuery}&rdquo;
                    </p>
                  )}
                  <p className="text-[10px] text-gray-500 tracking-wide">
                    {RING_LABELS[ringPhase]}
                  </p>
                </div>
              </div>
            )}

            {/* Text mode input - compact */}
            {mode === "text" && !ringPhase && (
              <form onSubmit={onSubmit} className="p-2 border-t border-gray-200 bg-white flex items-center gap-1.5 shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={listening ? "Listening..." : "e.g. grab me all pants under 300"}
                  className="flex-1 h-9 rounded-lg bg-gray-100 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={!SpeechRecognition}
                  aria-label={listening ? "Stop voice input" : "Start voice input"}
                  title={SpeechRecognition ? "Speak your request" : "Voice input not supported"}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                    listening
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FiMic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  className="h-9 w-9 rounded-lg bg-red-700 text-white flex items-center justify-center hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <FiSend className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Voice mode input - compact mic button */}
            {mode === "voice" && !ringPhase && (
              <div className="p-3 border-t border-gray-200 bg-white flex flex-col items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={!SpeechRecognition}
                  aria-label={listening ? "Stop listening" : "Start listening"}
                  className={`h-14 w-14 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    listening
                      ? "bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40"
                      : "bg-red-700 text-white hover:bg-red-800 shadow-md shadow-red-700/30"
                  }`}
                >
                  <FiMic className="w-5 h-5" />
                </button>
                <p className="text-[11px] text-gray-500">
                  {listening ? "Tap to stop" : "Tap to speak"}
                </p>
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
