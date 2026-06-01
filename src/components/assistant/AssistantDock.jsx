import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { AnimatePresence, motion, useAnimation, useReducedMotion } from "motion/react"
import {
  FiClock, FiLayers, FiHeart, FiHelpCircle, FiMapPin, FiMessageSquare,
  FiMic, FiMoreHorizontal, FiPackage, FiRotateCcw, FiSearch, FiShoppingBag, FiShoppingCart, FiStar,
  FiTag, FiTrash2, FiTruck, FiType, FiVolume2, FiVolumeX, FiX, FiRefreshCw, FiGlobe, FiFilter, FiTrendingUp,
} from "react-icons/fi"
import OrbCanvas from "./OrbCanvas"
import MessageList from "./MessageList"
import Composer from "./Composer"
import { useAssistantChat } from "./useAssistantChat"
import { useVoice } from "./useVoice"
import { useAuthStore } from "../../store/authStore"
import { ErrorState } from "../illustrations"

// The assistant shell: launcher + a glass panel centered on every screen size.
// It snaps out of the launcher and back into it. A very light, click-through scrim keeps
// the store usable and the panel stays open while the assistant navigates.

const STATUS = {
  idle: "Shopping assistant",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Something went wrong",
}
const HIDDEN_ON = ["/signin", "/signup"]
const GREETED_KEY = "diobral-assistant-greeted"
const STARTERS = [
  { t: "Hoodies under 3000", i: FiSearch },
  { t: "What's trending?", i: FiTrendingUp },
  { t: "Show me deals", i: FiTag },
  { t: "Track my orders", i: FiPackage },
]
const ACCENT = { idle: "#DC2626", listening: "#EF4444", thinking: "#9CA3AF", speaking: "#E11D48", error: "#7F1D1D" }
const STALE_MS = 2 * 3600 * 1000
const SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 }
const SNAP_BACK = { type: "spring", stiffness: 520, damping: 38 }
const SNAP_SCALE = 0.12

// Offset from the viewport center (where the panel sits) to the launcher's center.
function measureLauncher(el) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const r = el?.getBoundingClientRect()
  if (!r || !r.width) return { x: vw / 2 - 44, y: vh / 2 - 44 }
  return { x: r.left + r.width / 2 - vw / 2, y: r.top + r.height / 2 - vh / 2 }
}
const IS_MAC = typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform || "")
const SHORTCUT = IS_MAC ? "⌘K" : "Ctrl+K"

function routeChips(path) {
  if (path.startsWith("/products/"))
    return { label: "This product", chips: [{ t: "Is this in my size?", i: FiStar }, { t: "Similar items", i: FiLayers }, { t: "Add to cart", i: FiShoppingCart }] }
  if (path === "/cart")
    return { label: "Your cart", chips: [{ t: "Apply best savings", i: FiTag }, { t: "Checkout", i: FiShoppingBag }, { t: "Anything I forgot?", i: FiHelpCircle }] }
  if (path.startsWith("/orders"))
    return { label: "Your orders", chips: [{ t: "Where is my order?", i: FiTruck }, { t: "Return an item", i: FiRefreshCw }] }
  if (path.startsWith("/productlist"))
    return { label: "Browsing", chips: [{ t: "Filter under 3000", i: FiFilter }, { t: "Best rated here", i: FiStar }] }
  if (path === "/wishlist")
    return { label: "Wishlist", chips: [{ t: "Move my wishlist to cart", i: FiHeart }] }
  return { label: null, chips: STARTERS }
}

function welcome(fullName, firstVisit) {
  const name = fullName ? `, ${String(fullName).trim().split(/\s+/)[0]}` : ""
  const hour = new Date().getHours()
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const suggestions = STARTERS.map((s) => s.t)
  return firstVisit
    ? {
        text: `${hello}${name}! Welcome to DiObral. I'm **Obi**, your shopping assistant. I can find products, add them to your cart and take you anywhere in the store. Type below or use the mic. What are you looking for today?`,
        speech: `${hello}${name}! Welcome to DiObral. I'm Obi, your shopping assistant. What are you looking for today?`,
        suggestions,
      }
    : { text: `Welcome back${name}! What can I help you find today?`, suggestions }
}

const useIsMobile = () => {
  const query = "(max-width: 639px)"
  const [mobile, setMobile] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMobile(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return mobile
}

const useOnline = () => {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine))
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener("online", up)
    window.addEventListener("offline", down)
    return () => {
      window.removeEventListener("online", up)
      window.removeEventListener("offline", down)
    }
  }, [])
  return online
}

// Orb in a box that gives a tiny scale bump whenever the state changes.
const OrbBox = memo(function OrbBox({ state, size, levelRef, kickRef, active, quality, reduced }) {
  const controls = useAnimation()
  const prev = useRef(state)
  useEffect(() => {
    if (prev.current === state) return
    prev.current = state
    if (!reduced) controls.start({ scale: [1, 1.06, 1], transition: { duration: 0.3 } })
  }, [state, reduced, controls])
  return (
    <motion.span animate={controls} className="flex items-center justify-center">
      <OrbCanvas
        state={state}
        size={size}
        levelRef={levelRef}
        kickRef={kickRef}
        active={active}
        quality={quality}
        reducedMotion={reduced}
      />
    </motion.span>
  )
})

// 5-bar live waveform under the voice orb.
function Waveform({ levelRef, state, reduced }) {
  const bars = useRef([])
  useEffect(() => {
    if (reduced || (state !== "listening" && state !== "speaking")) {
      bars.current.forEach((b) => b && (b.style.transform = "scaleY(.3)"))
      return
    }
    let raf
    let last = 0
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return
      last = now
      const lvl = Math.min(1, (levelRef?.current || 0) * 3)
      bars.current.forEach((b, i) => {
        if (!b) return
        const wave = 0.5 + 0.5 * Math.sin(now / 130 + i * 1.3)
        const v = state === "listening" ? 0.18 + lvl * (0.5 + 0.5 * wave) : 0.25 + 0.55 * wave
        b.style.transform = `scaleY(${Math.min(1, v).toFixed(2)})`
      })
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [state, reduced, levelRef])
  return (
    <div className="mt-1 flex h-6 items-center gap-1" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          ref={(el) => (bars.current[i] = el)}
          className="h-6 w-1 origin-center rounded-full bg-red-500"
          style={{ transform: "scaleY(.3)" }}
        />
      ))}
    </div>
  )
}

const ring = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
const menuRow =
  `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] font-medium text-gray-700 transition-colors hover:bg-red-50/70 hover:text-red-700 ${ring}`
const headBtn =
  `flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-white/50 text-gray-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white/85 hover:text-red-600 ${ring}`
const glassBtn =
  `inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/70 bg-white/50 px-3 text-[12.5px] font-medium text-gray-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white/85 hover:text-red-600 disabled:opacity-40 ${ring}`
const glassInset = "rounded-xl border border-white/60 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
const PANEL_SHADOW =
  "0 30px 80px -24px rgba(17,24,39,0.35), 0 12px 32px -12px rgba(17,24,39,0.18), 0 0 70px -18px rgba(220,38,38,0.32), inset 0 1px 0 rgba(255,255,255,0.85)"

export default function AssistantDock() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState("text") // text | voice
  const [input, setInput] = useState("")
  const [peek, setPeek] = useState(null)
  const [unread, setUnread] = useState(false)
  const [everOpened, setEverOpened] = useState(false)
  const [errorFlash, setErrorFlash] = useState(false)
  const [revealId, setRevealId] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [resume, setResume] = useState(false)
  const isMobile = useIsMobile()
  const online = useOnline()
  const reduced = !!useReducedMotion()
  const { pathname } = useLocation()
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const launcherRef = useRef(null)
  const panelRef = useRef(null)
  const orbBtnRef = useRef(null)
  const flashTimer = useRef(null)
  const entryDelay = useRef(1.2)
  const fullName = useAuthStore((s) => s.user?.fullName)

  // refs for callbacks that fire later (speech end, recognition end, key handlers)
  const live = useRef({})
  const spokenInput = useRef(false)
  const silentStreak = useRef(0)

  const voice = useVoice({
    onInterim: setInput,
    onFinal: (text) => {
      setInput("")
      silentStreak.current = 0
      spokenInput.current = true
      setRevealId(null)
      live.current.chat.send(text)
    },
    onSilence: (why) => {
      // hands-free: give the user one more chance, then go quiet instead of nagging
      silentStreak.current++
      if (why !== "denied" && live.current.mode === "voice" && live.current.open && silentStreak.current < 2) {
        setTimeout(() => live.current.open && live.current.mode === "voice" && live.current.voice.listen(), 300)
      }
    },
  })

  const chat = useAssistantChat({
    onReply: (msg) => {
      if (msg.error) {
        setErrorFlash(true)
        clearTimeout(flashTimer.current)
        flashTimer.current = setTimeout(() => setErrorFlash(false), 1400)
      }
      const { open, mode, reduced } = live.current
      if (!open) {
        setPeek(msg.text)
        setUnread(true)
      } else if (mode === "text" && !reduced && !msg.error) {
        setRevealId(msg.id)
      }
      const talk = open && (mode === "voice" || spokenInput.current)
      spokenInput.current = false
      if (!talk) return
      live.current.voice.speak(msg.speech, () => {
        // keep the conversation going hands-free in voice mode
        if (live.current.open && live.current.mode === "voice") {
          silentStreak.current = 0
          setTimeout(() => live.current.open && live.current.mode === "voice" && live.current.voice.listen(), 300)
        }
      })
    },
    onNavigate: () => {
      // on phones the sheet covers the page; get out of the way so the user sees where we went
      if (live.current.isMobile && live.current.mode === "text") {
        setOpen(false)
        setPeek(null)
      }
    },
  })

  live.current = { open, mode, isMobile, reduced, voice, chat, fullName, pathname }

  useEffect(() => () => clearTimeout(flashTimer.current), [])
  useEffect(() => {
    const t = setTimeout(() => (entryDelay.current = 0), 1600)
    return () => clearTimeout(t)
  }, [])

  const orbState = errorFlash
    ? "error"
    : voice.state === "listening"
      ? "listening"
      : chat.loading
        ? "thinking"
        : voice.state === "speaking"
          ? "speaking"
          : "idle"

  const minimize = useCallback(() => {
    const { voice } = live.current
    voice.stopListening()
    voice.cancelSpeech()
    setMenuOpen(false)
    setConfirmClear(false)
    setOpen(false)
    setTimeout(() => launcherRef.current?.focus(), 60)
  }, [])

  const sayHello = useCallback((speakIt) => {
    const { chat, voice, fullName } = live.current
    let firstVisit = true
    try {
      firstVisit = !localStorage.getItem(GREETED_KEY)
      localStorage.setItem(GREETED_KEY, "1")
    } catch { /* private mode: treat as first visit */ }
    const msg = welcome(fullName, firstVisit)
    chat.greet(msg)
    // spoken once, on the very first open (it follows a click, so the browser allows audio)
    if (speakIt && firstVisit) voice.speak(msg.speech)
  }, [])

  const openDock = useCallback(() => {
    const { chat } = live.current
    setOrigin(measureLauncher(launcherRef.current))
    setPeek(null)
    setUnread(false)
    setEverOpened(true)
    setOpen(true)
    if (!chat.messages.length) sayHello(true)
    else if (chat.lastActiveAt && Date.now() - chat.lastActiveAt > STALE_MS && chat.messages.length > 1) setResume(true)
  }, [sayHello])

  const newConversation = useCallback(() => {
    live.current.voice.cancelSpeech()
    live.current.chat.reset()
    setRevealId(null)
    setResume(false)
    sayHello(false)
  }, [sayHello])

  const clearHistory = useCallback(() => {
    const { chat } = live.current
    chat.recent.forEach(chat.removeRecent)
    setConfirmClear(false)
    setMenuOpen(false)
    newConversation()
  }, [newConversation])

  const switchMode = useCallback((next) => {
    const { voice } = live.current
    voice.stopListening()
    voice.cancelSpeech()
    setInput("")
    setMode(next)
    if (next === "voice") {
      silentStreak.current = 0
      setTimeout(() => orbBtnRef.current?.focus(), 50)
      voice.listen()
    }
  }, [])

  // tap the orb: interrupt speech and talk, or stop listening
  const orbTap = () => {
    if (voice.state === "listening") return voice.stopListening()
    silentStreak.current = 0
    voice.listen()
  }
  const micToggle = useCallback(() => {
    const { voice } = live.current
    return voice.state === "listening" ? voice.stopListening() : voice.listen()
  }, [])

  // stable callbacks for the memoized list + composer
  const send = useCallback((text) => {
    setRevealId(null)
    live.current.voice.cancelSpeech()
    live.current.chat.send(text)
  }, [])
  const submit = useCallback((text) => {
    setInput("")
    send(text)
  }, [send])
  const doneReveal = useCallback(() => setRevealId(null), [])
  const { retry, regenerate, setFeedback, openProduct, addProduct, goTo, stop } = chat
  const toggleCompare = chat.compare.toggle
  const compareIds = useMemo(() => chat.compare.items.map((p) => p._id), [chat.compare.items])

  const commands = useMemo(() => {
    const c = () => live.current.chat
    const list = [
      { cmd: "/cart", label: "Open my cart", icon: FiShoppingCart, run: () => c().goTo("/cart") },
      { cmd: "/orders", label: "Open my orders", icon: FiPackage, run: () => c().goTo("/orders") },
      { cmd: "/wishlist", label: "Open my wishlist", icon: FiHeart, run: () => c().goTo("/wishlist") },
      { cmd: "/deals", label: "Browse deals", icon: FiTag, run: () => c().goTo("/productlist/all?sale=true") },
      { cmd: "/clear", label: "Start a new conversation", icon: FiRotateCcw, run: () => newConversation() },
      { cmd: "/voice", label: "Switch to voice mode", icon: FiMic, run: () => switchMode("voice") },
    ]
    list.push({
      cmd: "/help",
      label: "Show all commands",
      icon: FiHelpCircle,
      run: () =>
        c().greet({
          text: `Here's what I can do:\n${[...list.map((x) => `**${x.cmd}** ${x.label}`), "**/help** Show all commands"].join("\n")}\nOr just ask me anything about the store.`,
        }),
    })
    return list
  }, [newConversation, switchMode])

  // Ctrl/Cmd+K toggles, Esc minimizes (menu first)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        if (HIDDEN_ON.includes(live.current.pathname)) return
        const t = e.target
        const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
        if (typing && !panelRef.current?.contains(t)) return
        e.preventDefault()
        if (live.current.open) minimize()
        else openDock()
        return
      }
      if (e.key === "Escape" && live.current.open && !e.defaultPrevented) {
        if (menuOpen) {
          setMenuOpen(false)
          setConfirmClear(false)
        } else minimize()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen, minimize, openDock])

  // keep the snap target in sync with the launcher while open (rotation, resize)
  useEffect(() => {
    if (!open) return
    let raf
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setOrigin(measureLauncher(launcherRef.current)))
    }
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [open])

  useEffect(() => {
    if (!peek) return
    const t = setTimeout(() => setPeek(null), 7000)
    return () => clearTimeout(t)
  }, [peek])

  if (HIDDEN_ON.includes(pathname)) return null

  const lastTurn = chat.messages.slice(Math.max(0, chat.messages.map((m) => m.role).lastIndexOf("user")))
  const { label: ctxLabel, chips } = routeChips(pathname)
  const showRecent = chat.messages.length <= 1 && chat.recent.length > 0
  const showChips = mode === "text" && !input && !chat.loading && online
  const status = orbState === "thinking" && chat.stage ? chat.stage : STATUS[orbState]
  const fade = reduced ? { duration: 0.12 } : undefined

  return (
    <>
      {/* launcher: the orb itself, alive even when closed. It stays mounted so the panel
          can snap out of it and back into it; while open it squashes and hides. */}
      <motion.div
        key="launcher"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduced ? fade : { type: "spring", stiffness: 420, damping: 26, delay: entryDelay.current }}
        className={`fixed bottom-5 right-5 z-[60] flex items-end gap-3 ${open ? "pointer-events-none" : ""}`}
        aria-hidden={open || undefined}
      >
        <AnimatePresence>
          {peek && !open && (
            <motion.button
              initial={{ opacity: 0, x: reduced ? 0 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduced ? 0 : 10 }}
              onClick={openDock}
              className={`mb-2 max-w-[240px] rounded-xl rounded-br-sm border border-white/70 bg-white/70 px-3.5 py-2.5 text-left text-[12.5px] leading-snug text-gray-700 shadow-[0_18px_40px_-16px_rgba(17,24,39,0.3),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150 line-clamp-3 ${ring}`}
            >
              {peek}
            </motion.button>
          )}
        </AnimatePresence>
        <motion.div
          className="relative"
          initial={false}
          animate={
            open
              ? reduced
                ? { opacity: 0, scale: 1 }
                : { scale: [1, 0.8, 1.06, 0], opacity: [1, 1, 1, 0] }
              : { opacity: 1, scale: 1 }
          }
          transition={
            open
              ? reduced
                ? fade
                : { duration: 0.26, times: [0, 0.3, 0.55, 1], ease: "easeOut" }
              : reduced
                ? fade
                : { type: "spring", stiffness: 460, damping: 24, delay: 0.14 }
          }
        >
          {!everOpened && !reduced && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-red-300"
              animate={{ scale: [1, 1.35], opacity: [0.35, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 5.6, ease: "easeOut", delay: 2 }}
            />
          )}
          <motion.button
            ref={launcherRef}
            onClick={openDock}
            tabIndex={open ? -1 : undefined}
            whileTap={reduced ? undefined : { scale: 0.9 }}
            aria-label={`Open shopping assistant (${SHORTCUT})`}
            aria-keyshortcuts={IS_MAC ? "Meta+K" : "Control+K"}
            title={`Ask Obi (${SHORTCUT})`}
            className={`relative flex h-12 items-center gap-2.5 rounded-full border border-white/70 bg-white/65 pl-1.5 pr-4 shadow-[0_18px_40px_-14px_rgba(17,24,39,0.35),0_0_30px_-10px_rgba(220,38,38,0.35),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-150 transition-colors hover:bg-white/85 max-sm:pr-1.5 ${ring}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-gray-100 ring-1 ring-white/80">
                  <OrbBox
                    state={orbState}
                    size={34}
                    levelRef={voice.levelRef}
                    kickRef={voice.kickRef}
                    active={!open}
                    quality="low"
                    reduced={reduced}
                  />
                </span>
                <span className="text-left leading-snug max-sm:hidden">
                  <span className="block text-[13px] font-semibold text-gray-900">Ask Obi</span>
                  <span className="flex items-center gap-1 text-[10.5px] text-gray-500">
                    <FiMessageSquare className="h-2.5 w-2.5 text-red-500" /> {SHORTCUT}
                  </span>
                </span>
                {unread && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-600 ring-2 ring-white"
                    role="status"
                    aria-label="New reply"
                  />
                )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* very light neutral scrim; click-through so the store stays usable */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.22 }}
            className="pointer-events-none fixed inset-0 z-[59] bg-[radial-gradient(ellipse_at_center,rgba(17,24,39,0.10),rgba(17,24,39,0.04)_70%)]"
          />
        )}
      </AnimatePresence>

      {/* centering frame: same padding on all sides so the panel center is the viewport center */}
      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="Shopping assistant"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: SNAP_SCALE, x: origin.x, y: origin.y }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, transition: reduced ? fade : { ...SPRING, opacity: { duration: 0.14 } } }}
            exit={
              reduced
                ? { opacity: 0, transition: fade }
                : {
                    opacity: 0,
                    scale: SNAP_SCALE,
                    x: origin.x,
                    y: origin.y,
                    transition: { ...SNAP_BACK, opacity: { duration: 0.16, delay: 0.1 } },
                  }
            }
            style={{ transformOrigin: "50% 50%", boxShadow: PANEL_SHADOW }}
            className="pointer-events-auto relative isolate flex h-[min(660px,calc(100dvh-2rem))] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl
              border border-white/60 bg-white/60 text-gray-900 backdrop-blur-2xl backdrop-saturate-150 sm:h-[min(680px,calc(100dvh-3rem))]"
          >
            {/* glass depth: top highlight + soft red glow, behind content */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent" />
              <div className="absolute -top-28 left-1/2 h-56 w-[130%] -translate-x-1/2 rounded-full bg-red-400/15 blur-3xl" />
              <div className="absolute -bottom-24 -right-16 h-48 w-48 rounded-full bg-red-300/20 blur-3xl" />
              <div className="absolute inset-x-6 top-px h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>
            {/* accent bar; its colour follows the assistant's state, thinking shimmers */}
            <div aria-hidden className="relative h-[3px] w-full shrink-0 overflow-hidden">
              <motion.div
                className="absolute inset-0"
                animate={{ backgroundColor: ACCENT[orbState] }}
                transition={{ duration: reduced ? 0.12 : 0.4 }}
              />
              {orbState === "thinking" && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "linear-gradient(90deg,#E5E7EB,#9CA3AF,#E5E7EB,#9CA3AF,#E5E7EB)",
                    backgroundSize: "200% 100%",
                  }}
                  initial={{ backgroundPosition: "0% 0%" }}
                  animate={reduced ? undefined : { backgroundPosition: ["0% 0%", "-200% 0%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            {/* header */}
            <header className="relative flex shrink-0 items-center gap-2.5 border-b border-white/50 bg-white/30 px-4 py-2.5">
              {mode === "text" && (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-50/90 to-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-white/70">
                  <OrbBox
                    state={orbState}
                    size={38}
                    levelRef={voice.levelRef}
                    kickRef={voice.kickRef}
                    active={open}
                    quality="low"
                    reduced={reduced}
                  />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-tight text-gray-900">Obi</p>
                <p className="truncate text-[11px] leading-tight text-gray-500" role="status">{status}</p>
              </div>
              <button
                onClick={() => switchMode(mode === "text" ? "voice" : "text")}
                disabled={mode === "text" && !voice.canListen}
                title={voice.canListen ? undefined : "Voice needs Chrome, Edge or Safari"}
                className={glassBtn}
              >
                {mode === "text" ? <><FiMic className="h-3.5 w-3.5 text-red-500" /> Voice</> : <><FiType className="h-3.5 w-3.5 text-red-500" /> Type</>}
              </button>
              <div className="relative">
                <button
                  onClick={() => {
                    setMenuOpen((v) => !v)
                    setConfirmClear(false)
                  }}
                  aria-label="More options"
                  aria-expanded={menuOpen}
                  className={headBtn}
                >
                  <FiMoreHorizontal className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
                      transition={reduced ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 34 }}
                      style={{ transformOrigin: "top right" }}
                      className="absolute right-0 top-10 z-20 w-60 rounded-xl border border-white/70 bg-white/80 p-2 shadow-[0_24px_50px_-18px_rgba(17,24,39,0.35),0_0_40px_-16px_rgba(220,38,38,0.3),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-150"
                    >
                      <p className="flex items-center gap-1.5 px-3 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-normal text-gray-400">
                        <FiGlobe className="h-3 w-3" /> Voice language
                      </p>
                      <div className="flex gap-1.5 px-2 pb-2">
                        {[["en-US", "English"], ["ur-PK", "اردو"]].map(([code, name]) => (
                          <button
                            key={code}
                            onClick={() => voice.setLang?.(code)}
                            aria-pressed={voice.lang === code}
                            className={`soft-chip !px-3 !py-1 !text-[11.5px] ${voice.lang === code ? "soft-chip-active" : ""}`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => voice.setMuted?.(!voice.muted)} className={menuRow} role="switch" aria-checked={!!voice.muted}>
                        {voice.muted ? <FiVolumeX className="h-4 w-4 text-red-500" /> : <FiVolume2 className="h-4 w-4 text-red-500" />}
                        {voice.muted ? "Replies muted (listen only)" : "Mute spoken replies"}
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          newConversation()
                        }}
                        className={menuRow}
                      >
                        <FiRotateCcw className="h-4 w-4 text-red-500" /> New conversation
                      </button>
                      {confirmClear ? (
                        <div className={`${glassInset} mt-1 p-2.5`}>
                          <p className="text-[12px] text-gray-600">Delete all saved chats?</p>
                          <div className="mt-2 flex gap-1.5">
                            <button onClick={clearHistory} className="soft-btn soft-btn-primary soft-btn-sm">Clear</button>
                            <button onClick={() => setConfirmClear(false)} className="soft-btn soft-btn-ghost soft-btn-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmClear(true)} className={menuRow}>
                          <FiTrash2 className="h-4 w-4 text-red-500" /> Clear history
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={minimize} aria-label="Minimize assistant" className={headBtn}>
                <FiX className="h-4 w-4" />
              </button>
            </header>

            {resume && mode === "text" && (
              <div className={`${glassInset} mx-3 mt-3 flex shrink-0 flex-wrap items-center gap-2 px-3 py-2.5`}>
                <span className="soft-icon-tile soft-icon-tile-sm"><FiClock className="h-4 w-4" /></span>
                <p className="min-w-0 flex-1 text-[12.5px] font-medium text-gray-700">Continue where you left off?</p>
                <button onClick={() => setResume(false)} className="soft-btn soft-btn-primary soft-btn-sm">Continue</button>
                <button onClick={newConversation} className="soft-btn soft-btn-ghost soft-btn-sm">Start fresh</button>
              </div>
            )}

            {mode === "voice" ? (
              <>
                <div className="relative flex shrink-0 flex-col items-center pt-1">
                  <button
                    ref={orbBtnRef}
                    onClick={orbTap}
                    aria-label={voice.state === "listening" ? "Stop listening" : "Tap to talk"}
                    className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                  >
                    <OrbBox
                      state={orbState}
                      size={isMobile ? 190 : 210}
                      levelRef={voice.levelRef}
                      kickRef={voice.kickRef}
                      active={open}
                      quality="high"
                      reduced={reduced}
                    />
                  </button>
                  <Waveform levelRef={voice.levelRef} state={voice.state} reduced={reduced} />
                  <p className="mt-1 min-h-[2.5em] max-w-[85%] text-center text-[15px] font-medium leading-snug text-gray-700 line-clamp-2">
                    {voice.state === "listening"
                      ? input || "Go ahead, I'm listening"
                      : chat.loading
                        ? chat.stage || "One moment…"
                        : voice.state === "speaking"
                          ? "Tap the orb to interrupt"
                          : "Tap the orb to talk"}
                  </p>
                </div>
                <MessageList
                  compact
                  messages={lastTurn}
                  loading={false}
                  onSend={send}
                  onOpenProduct={openProduct}
                  onAddProduct={addProduct}
                  onGoTo={goTo}
                />
              </>
            ) : (
              <>
                <MessageList
                  messages={chat.messages}
                  loading={chat.loading}
                  stage={chat.stage}
                  revealId={revealId}
                  onRevealDone={doneReveal}
                  onSend={send}
                  onRetry={retry}
                  onRegenerate={regenerate}
                  onFeedback={setFeedback}
                  onOpenProduct={openProduct}
                  onAddProduct={addProduct}
                  onGoTo={goTo}
                  onCompare={toggleCompare}
                  compareIds={compareIds}
                />

                {!online && (
                  <div className={`${glassInset} mx-3 mb-2 flex shrink-0 items-center gap-3 p-3`} role="alert">
                    <ErrorState size={120} className="shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">You&apos;re offline</p>
                      <p className="text-[12px] text-gray-500">I&apos;ll be back as soon as your connection returns.</p>
                    </div>
                  </div>
                )}

                {showChips && (
                  <motion.div
                    key={pathname}
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.04 } } }}
                    className="flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-2 pt-1 [scrollbar-width:none]"
                  >
                    {ctxLabel && (
                      <span className="soft-btn soft-btn-secondary soft-btn-sm shrink-0 cursor-default">
                        <FiMapPin className="h-3.5 w-3.5" /> {ctxLabel}
                      </span>
                    )}
                    {chips.map(({ t, i: Icon }) => (
                      <motion.button
                        key={t}
                        variants={{ hidden: { opacity: 0, y: reduced ? 0 : 6 }, show: { opacity: 1, y: 0 } }}
                        onClick={() => send(t)}
                        className="soft-chip shrink-0 !text-[12px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                      >
                        <Icon className="h-3.5 w-3.5 text-red-500" /> {t}
                      </motion.button>
                    ))}
                    {showRecent &&
                      chat.recent.map((r) => (
                        <motion.span
                          key={r}
                          variants={{ hidden: { opacity: 0, y: reduced ? 0 : 6 }, show: { opacity: 1, y: 0 } }}
                          className="soft-chip shrink-0 !gap-1 !py-0 !pr-1 !text-[12px]"
                        >
                          <button
                            onClick={() => send(r)}
                            className="flex items-center gap-1.5 py-1.5 focus-visible:outline-none"
                          >
                            <FiClock className="h-3.5 w-3.5 text-red-500" /> {r}
                          </button>
                          <button
                            onClick={() => chat.removeRecent(r)}
                            aria-label={`Remove ${r}`}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </motion.span>
                      ))}
                  </motion.div>
                )}

                <Composer
                  value={input}
                  onChange={setInput}
                  onSubmit={submit}
                  onMic={micToggle}
                  onStop={stop}
                  listening={voice.state === "listening"}
                  loading={chat.loading}
                  canListen={voice.canListen}
                  autoFocus
                  disabled={!online}
                  placeholder={online ? "Ask Obi anything…" : "You're offline"}
                  commands={commands}
                />
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
      </div>
    </>
  )
}
