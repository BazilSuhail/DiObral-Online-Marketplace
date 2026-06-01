/* eslint-disable react/prop-types */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  FiAlertCircle, FiArrowDown, FiArrowRight, FiCheck, FiCheckCircle, FiCopy, FiLayers,
  FiRefreshCw, FiThumbsDown, FiThumbsUp, FiX,
} from "react-icons/fi"
import { API_BASE_URL } from "../../api/client"
import ProductCard from "./ProductCard"
import ConfirmCard from "./ConfirmCard"

const WINDOW = 60
const MORE = 40

// **bold** only; everything else is plain text (no HTML injection).
const RichText = ({ text }) =>
  String(text || "")
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    )

const priceOf = (p) => (p.sale > 0 ? Math.round(p.price - (p.price * p.sale) / 100) : p.price)
const imageSrc = (image) =>
  !image ? "/placeholder.png" : image.startsWith("http") ? image : `${API_BASE_URL}/uploads/${image}`

// glass styling + keyframes, prefixed so nothing leaks out of the assistant
const GLASS_CSS = `
.a5ml-scroll{scrollbar-width:thin;scrollbar-color:rgba(220,38,38,.28) transparent}
.a5ml-scroll::-webkit-scrollbar{width:6px;height:6px}
.a5ml-scroll::-webkit-scrollbar-track{background:transparent}
.a5ml-scroll::-webkit-scrollbar-thumb{background:rgba(156,163,175,.45);border-radius:6px}
.a5ml-scroll::-webkit-scrollbar-thumb:hover{background:rgba(220,38,38,.45)}
.a5ml-shimmer{position:relative;overflow:hidden;background:rgba(229,231,235,.7)}
.a5ml-shimmer::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),rgba(254,202,202,.55),transparent);animation:a5ml-sweep 1.4s ease-in-out infinite}
.a5ml-text-shimmer{background:linear-gradient(90deg,#6b7280 0%,#6b7280 35%,#dc2626 50%,#6b7280 65%,#6b7280 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:a5ml-text 1.8s linear infinite}
@keyframes a5ml-sweep{to{transform:translateX(100%)}}
@keyframes a5ml-text{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.a5ml-shimmer::after,.a5ml-text-shimmer{animation:none}.a5ml-text-shimmer{color:#6b7280;background:none}}
`

const glassBubble =
  "border border-white/70 bg-white/70 backdrop-blur-md shadow-[0_6px_18px_-8px_rgba(17,24,39,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]"
const glassChip =
  "rounded-lg border border-white/70 bg-white/55 px-2.5 py-1 text-[11.5px] font-medium text-gray-700 shadow-[0_2px_8px_-4px_rgba(17,24,39,0.15)] backdrop-blur-sm transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
const pop = { type: "spring", stiffness: 520, damping: 30, mass: 0.7 }

function ThinkingIndicator({ stage, reduced }) {
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduced ? { duration: 0.12 } : pop}
      style={{ transformOrigin: "0% 100%" }}
      className={`w-fit max-w-[88%] rounded-xl rounded-bl-sm px-3.5 py-2.5 ${glassBubble}`}
      role="status"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_6px_rgba(220,38,38,0.6)]"
              animate={reduced ? { opacity: 0.7 } : { y: [0, -4, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="a5ml-text-shimmer text-[12px] font-medium">{stage || "Thinking…"}</span>
      </div>
      <div className="mt-2 space-y-1.5" aria-hidden>
        <div className="a5ml-shimmer h-2 w-40 rounded" />
        <div className="a5ml-shimmer h-2 w-24 rounded" />
      </div>
    </motion.div>
  )
}

const iconBtn =
  "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white/80 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"

const MessageRow = memo(function MessageRow({
  m, isLastAssistant, canSuggest, revealing, reduced, compact, compareIds,
  onRevealDone, onSend, onRetry, onRegenerate, onFeedback, onOpenProduct, onAddProduct, onGoTo, onCompare,
}) {
  const [copied, setCopied] = useState(false)
  const [count, setCount] = useState(0)
  const copyTimer = useRef(null)
  const tokens = useMemo(() => (revealing ? String(m.text || "").match(/\S+\s*/g) || [] : []), [revealing, m.text])
  const typing = revealing && count < tokens.length

  useEffect(() => () => clearTimeout(copyTimer.current), [])

  useEffect(() => {
    if (!revealing) return
    const t = setInterval(() => setCount((c) => c + 3), 30)
    return () => clearInterval(t)
  }, [revealing])

  useEffect(() => {
    if (revealing && count >= tokens.length) onRevealDone?.(m.id)
  }, [revealing, count, tokens.length, onRevealDone, m.id])

  if (m.role === "note") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: reduced ? 1 : 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced ? { duration: 0.12 } : pop}
        className={`soft-badge ${m.ok ? "soft-badge-success" : "soft-badge-danger"} mx-auto flex w-fit items-center gap-1.5`}
      >
        {m.ok ? <FiCheckCircle className="h-3 w-3" /> : <FiAlertCircle className="h-3 w-3" />}
        {m.text}
      </motion.div>
    )
  }

  const mine = m.role === "user"
  let shown = m.text
  if (typing) shown = tokens.slice(0, count).join("").replace(/\*\*[^*]*$/, (s) => s.slice(2))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(m.text || "").replace(/\*\*/g, ""))
      setCopied(true)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  const vis = "opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100"
  const showTools = !mine && !typing && !compact

  return (
    <motion.div
      layout={reduced ? false : "position"}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={reduced ? { duration: 0.12 } : { duration: 0.2, ease: "easeOut" }}
      className={`group ${mine ? "flex justify-end" : ""}`}
    >
      <motion.div
        initial={reduced ? false : { scale: 0.86, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={pop}
        style={{ transformOrigin: mine ? "100% 100%" : "0% 100%" }}
        onClick={typing ? () => onRevealDone?.(m.id) : undefined}
        className={
          mine
            ? "max-w-[82%] rounded-xl rounded-br-sm border border-red-500/60 bg-red-600 px-3.5 py-2 text-[13px] text-white shadow-[0_8px_20px_-8px_rgba(220,38,38,0.6),inset_0_1px_0_rgba(255,255,255,0.22)]"
            : `w-fit max-w-[88%] rounded-xl rounded-bl-sm px-3.5 py-2.5 text-[13.5px] leading-relaxed ${glassBubble} ${
                m.error ? "!border-red-200 text-red-700" : "text-gray-700"
              }`
        }
      >
        {m.error && (
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
            <FiAlertCircle className="h-3.5 w-3.5" /> Couldn&apos;t complete that
          </span>
        )}
        <p className="whitespace-pre-wrap">
          <RichText text={shown} />
          {typing && (
            <motion.span
              aria-hidden
              className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 bg-red-500"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </p>
        {m.error && !compact && (
          <button
            onClick={() => onRetry?.(m.id)}
            className="soft-btn soft-btn-ghost soft-btn-sm mt-2 focus-visible:ring-4 focus-visible:ring-red-100"
          >
            <FiRefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        )}
      </motion.div>

      {showTools && !m.error && (
        <div className={`mt-1 flex items-center gap-0.5 pl-1 transition-opacity ${isLastAssistant ? "" : vis}`}>
          <button onClick={copy} className={iconBtn} aria-label={copied ? "Copied" : "Copy reply"} title="Copy">
            {copied ? <FiCheck className="h-3.5 w-3.5 text-emerald-600" /> : <FiCopy className="h-3.5 w-3.5" />}
          </button>
          {isLastAssistant && (
            <button onClick={onRegenerate} className={iconBtn} aria-label="Regenerate reply" title="Regenerate">
              <FiRefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => onFeedback?.(m.id, m.feedback === 1 ? 0 : 1)}
            aria-pressed={m.feedback === 1}
            aria-label="Good reply"
            title="Good reply"
            className={`${iconBtn} ${m.feedback === 1 ? "bg-red-50 text-red-600" : ""}`}
          >
            <FiThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onFeedback?.(m.id, m.feedback === -1 ? 0 : -1)}
            aria-pressed={m.feedback === -1}
            aria-label="Bad reply"
            title="Bad reply"
            className={`${iconBtn} ${m.feedback === -1 ? "bg-red-50 text-red-600" : ""}`}
          >
            <FiThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!typing && (
        <motion.div initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {m.products?.length > 0 && (
            <div data-lenis-prevent className="a5ml-scroll -mx-4 mt-2 flex snap-x gap-2 overflow-x-auto px-4 pb-1.5">
              {m.products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onOpen={onOpenProduct}
                  onAdd={onAddProduct}
                  onCompare={onCompare}
                  compared={!!compareIds?.includes(p._id)}
                />
              ))}
            </div>
          )}

          {m.pageUrl && m.products?.length > 0 && (
            <button
              onClick={() => onGoTo(m.pageUrl)}
              className="group/see mt-1.5 flex items-center gap-1 rounded-md px-1 text-[11px] font-semibold text-red-600 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
            >
              See all results <FiArrowRight className="h-3 w-3 transition-transform group-hover/see:translate-x-0.5" />
            </button>
          )}

          {m.confirm && <ConfirmCard onConfirm={() => onGoTo("/checkout")} />}

          {canSuggest && m.suggestions?.length > 0 && (
            <motion.div
              className="mt-2 flex flex-wrap gap-1.5"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.08 } } }}
            >
              {m.suggestions.map((s) => (
                <motion.button
                  key={s}
                  variants={{
                    hidden: { opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.9 },
                    show: { opacity: 1, y: 0, scale: 1, transition: reduced ? { duration: 0.12 } : pop },
                  }}
                  whileHover={reduced ? undefined : { y: -1 }}
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  onClick={() => onSend(s)}
                  className={glassChip}
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
})

function CompareTable({ items, onClose, onAsk }) {
  const rows = [
    ["Price", (p) => `Rs. ${priceOf(p)?.toLocaleString()}`],
    ["Sale", (p) => (p.sale > 0 ? `-${p.sale}%` : "-")],
    ["Rating", (p) => (p.rating > 0 ? Number(p.rating).toFixed(1) : "-")],
    ["Sizes", (p) => (p.size?.length ? p.size.join(", ") : "-")],
    ["Stock", (p) => (p.stock === undefined ? "-" : p.stock < 1 ? "Out of stock" : `${p.stock} left`)],
  ]
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="absolute inset-0 z-10 flex flex-col border-t border-white/80 bg-white/85 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="soft-icon-tile soft-icon-tile-sm !rounded-lg"><FiLayers className="h-4 w-4" /></span>
        <h3 className="flex-1 text-sm font-semibold text-gray-900">Compare</h3>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/80 bg-white/70 text-gray-500 shadow-soft-xs transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
          aria-label="Close comparison"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
      <div className="soft-divider" />
      <div data-lenis-prevent className="a5ml-scroll flex-1 overflow-auto bg-gray-100/50 p-3">
        <table className="w-full min-w-[320px] table-fixed border-separate border-spacing-y-1 text-left text-[12px]">
          <thead>
            <tr>
              <th className="w-16" />
              {items.map((p) => (
                <th key={p._id} className="px-1 align-top font-medium text-gray-800">
                  <img src={imageSrc(p.image)} alt="" className="mb-1 h-14 w-full rounded-lg bg-gray-200 object-cover ring-1 ring-white/80" />
                  <span className="line-clamp-2 leading-snug">{p.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label}>
                <td className="py-1.5 pr-1 text-[11px] font-semibold text-gray-500">{label}</td>
                {items.map((p) => (
                  <td key={p._id} className="rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-gray-800 shadow-soft-xs">{fn(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3">
        <button onClick={onAsk} className="soft-btn soft-btn-primary w-full !rounded-lg">
          Ask Obi <FiArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

function CompareTray({ items, onRemove, onOpen }) {
  const reduced = !!useReducedMotion()
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="absolute inset-x-3 bottom-2 z-[5] flex items-center gap-2 rounded-xl border border-white/80 bg-white/80 p-2 shadow-[0_10px_30px_-10px_rgba(17,24,39,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl"
    >
      <FiLayers className="ml-1 h-4 w-4 shrink-0 text-red-500" />
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {items.map((p) => (
          <motion.span
            key={p._id}
            className="relative"
            initial={reduced ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={pop}
          >
            <img src={imageSrc(p.image)} alt={p.name} className="h-9 w-9 rounded-md bg-gray-100 object-cover ring-1 ring-white" />
            <button
              onClick={() => onRemove(p)}
              aria-label={`Remove ${p.name} from comparison`}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600"
            >
              <FiX className="h-2.5 w-2.5" />
            </button>
          </motion.span>
        ))}
      </div>
      <button
        onClick={onOpen}
        disabled={items.length < 2}
        className="soft-btn soft-btn-primary soft-btn-sm !rounded-lg disabled:opacity-40"
      >
        Compare ({items.length})
      </button>
    </motion.div>
  )
}

function MessageList({
  messages, loading, stage, revealId, onRevealDone, onSend, onRetry, onRegenerate, onFeedback,
  onOpenProduct, onAddProduct, onGoTo, onCompare, compareIds, compact,
}) {
  const reduced = !!useReducedMotion()
  const scrollRef = useRef(null)
  const innerRef = useRef(null)
  const stick = useRef(true)
  const [atBottom, setAtBottom] = useState(true)
  const [limit, setLimit] = useState(WINDOW)
  const [tableOpen, setTableOpen] = useState(false)

  const visible = messages.length > limit ? messages.slice(-limit) : messages
  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "assistant") return messages[i].id
    return null
  }, [messages])

  const compared = useMemo(() => {
    if (!compareIds?.length) return []
    const found = new Map()
    for (const m of messages) for (const p of m.products || []) if (compareIds.includes(p._id)) found.set(p._id, p)
    return compareIds.map((id) => found.get(id)).filter(Boolean)
  }, [messages, compareIds])

  const live = useMemo(() => {
    const m = messages.find((x) => x.id === lastAssistantId)
    return m && m.id !== revealId ? m.text : ""
  }, [messages, lastAssistantId, revealId])

  const toBottom = useCallback((smooth) => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduced ? "smooth" : "auto" })
  }, [reduced])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    stick.current = near
    setAtBottom(near)
  }, [])

  // content grows (new rows, typewriter, images): follow it only while the user is at the bottom
  useEffect(() => {
    const inner = innerRef.current
    if (!inner || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => {
      if (stick.current) toBottom(false)
      else setAtBottom(false)
    })
    ro.observe(inner)
    return () => ro.disconnect()
  }, [toBottom])

  const lastRole = messages.at(-1)?.role
  useEffect(() => {
    if (lastRole === "user") {
      stick.current = true
      toBottom(true)
    }
  }, [messages.length, lastRole, toBottom])

  useEffect(() => {
    if (compared.length < 2) setTableOpen(false)
  }, [compared.length])

  const askCompare = () => {
    setTableOpen(false)
    onSend?.(`Compare: ${compared.map((p) => p.name).join(", ")}`)
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-transparent">
      <style>{GLASS_CSS}</style>
      {/* the log itself stays silent; the node below announces each final reply once */}
      <span className="sr-only" aria-live="polite">{live}</span>
      {/* data-lenis-prevent: the home page's smooth-scroll would otherwise swallow wheel events here */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        data-lenis-prevent
        role="log"
        aria-live="off"
        aria-label="Conversation"
        className="a5ml-scroll flex-1 overflow-y-auto overscroll-contain px-4 py-3"
      >
        <div ref={innerRef} className={`space-y-3 ${compared.length ? "pb-16" : ""}`}>
          {messages.length > limit && (
            <button
              onClick={() => setLimit((l) => l + MORE)}
              className={`${glassChip} mx-auto flex !text-[11px]`}
            >
              Show earlier
            </button>
          )}
          {visible.map((m) => (
            <MessageRow
              key={m.id}
              m={m}
              isLastAssistant={m.id === lastAssistantId}
              canSuggest={m.id === lastAssistantId && !loading}
              revealing={!reduced && !compact && m.id === revealId}
              reduced={reduced}
              compact={compact}
              compareIds={m.products?.length ? compareIds : undefined}
              onRevealDone={onRevealDone}
              onSend={onSend}
              onRetry={onRetry}
              onRegenerate={onRegenerate}
              onFeedback={onFeedback}
              onOpenProduct={onOpenProduct}
              onAddProduct={onAddProduct}
              onGoTo={onGoTo}
              onCompare={onCompare}
            />
          ))}
          {loading && <ThinkingIndicator stage={stage} reduced={reduced} />}
        </div>
      </div>

      <AnimatePresence>
        {!atBottom && (
          <motion.button
            key="jump"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
            onClick={() => {
              stick.current = true
              toBottom(true)
              setAtBottom(true)
            }}
            className={`absolute left-1/2 z-[6] flex -translate-x-1/2 items-center gap-1.5 rounded-lg border border-white/80 bg-white/80 px-3 py-1.5 text-[12px] font-medium text-gray-700 shadow-soft backdrop-blur-md transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 ${compared.length ? "bottom-16" : "bottom-3"}`}
          >
            <FiArrowDown className="h-3.5 w-3.5 text-red-500" /> Jump to latest
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {compared.length > 0 && (
          <CompareTray key="tray" items={compared} onRemove={onCompare} onOpen={() => setTableOpen(true)} />
        )}
        {tableOpen && compared.length > 1 && (
          <CompareTable key="table" items={compared} onClose={() => setTableOpen(false)} onAsk={askCompare} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(MessageList)
