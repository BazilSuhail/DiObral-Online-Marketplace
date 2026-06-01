/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { FiArrowUp, FiMic, FiSquare, FiCornerDownLeft } from "react-icons/fi"

// Always visible and always editable, even while the assistant thinks or speaks.
export default function Composer({
  value,
  onChange,
  onSubmit,
  onMic,
  onStop,
  listening,
  loading,
  canListen,
  autoFocus,
  disabled = false,
  placeholder,
  commands = [],
}) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [dismissedFor, setDismissedFor] = useState(null)
  const [sent, setSent] = useState(0) // bumps on each send, drives the arrow fly-out

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  // grow with the text, up to ~5 lines
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  // slash menu: only while the whole input is a single "/word"
  const filtered = useMemo(() => {
    if (!value.startsWith("/") || /\s/.test(value)) return []
    const q = value.toLowerCase()
    return commands.filter((c) => c.cmd.toLowerCase().startsWith(q))
  }, [value, commands])
  const menuOpen = !disabled && filtered.length > 0 && dismissedFor !== value
  const idx = Math.min(active, Math.max(filtered.length - 1, 0))

  const changeValue = (v) => {
    setActive(0)
    setDismissedFor(null)
    onChange(v)
  }

  const runCommand = (c) => {
    onChange("")
    setDismissedFor(null)
    c.run?.()
  }

  const submit = (e) => {
    e?.preventDefault()
    if (disabled) return
    if (menuOpen) return runCommand(filtered[idx])
    if (value.trim() && !loading) {
      setSent((n) => n + 1)
      onSubmit(value)
    }
  }

  const onKeyDown = (e) => {
    if (menuOpen) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((idx + 1) % filtered.length); return }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((idx - 1 + filtered.length) % filtered.length); return }
      if (e.key === "Tab") { e.preventDefault(); runCommand(filtered[idx]); return }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setDismissedFor(value); return }
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e)
  }

  const fade = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
    : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 4 }, transition: { duration: 0.12 } }

  return (
    <form onSubmit={submit} className="relative shrink-0 p-3 pt-2">
      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            {...fade}
            id="assistant-slash-menu"
            role="listbox"
            aria-label="Commands"
            className="absolute inset-x-3 bottom-full z-10 mb-1 max-h-56 overflow-y-auto rounded-xl border border-white/80 bg-white/85 p-1.5 shadow-[0_16px_40px_-12px_rgba(17,24,39,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl [scrollbar-width:thin]"
          >
            {filtered.map((c, i) => {
              const Icon = c.icon
              return (
                <li
                  key={c.cmd}
                  id={`assistant-cmd-${i}`}
                  role="option"
                  aria-selected={i === idx}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => { e.preventDefault(); runCommand(c) }}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors ${
                    i === idx ? "bg-red-50/80 text-gray-900" : "text-gray-600"
                  }`}
                >
                  <span className="soft-icon-tile soft-icon-tile-sm !rounded-md">
                    {Icon ? <Icon className="h-4 w-4" /> : <FiCornerDownLeft className="h-4 w-4" />}
                  </span>
                  <span className="font-semibold text-red-600">{c.cmd}</span>
                  <span className="min-w-0 flex-1 truncate text-gray-500">{c.label}</span>
                  {i === idx && <FiCornerDownLeft className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <div
        className={`flex items-end gap-1.5 rounded-xl border border-white/70 bg-white/55 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(17,24,39,0.04),0_6px_20px_-10px_rgba(17,24,39,0.22)] backdrop-blur-md transition-all duration-200 focus-within:border-red-200 focus-within:bg-white/85 focus-within:ring-4 focus-within:ring-red-100/70 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => changeValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={listening ? "Listening…" : placeholder || "Ask for anything, or type / for commands"}
          aria-label="Message"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? "assistant-slash-menu" : undefined}
          aria-activedescendant={menuOpen ? `assistant-cmd-${idx}` : undefined}
          className="max-h-[120px] flex-1 resize-none bg-transparent px-2 py-2 text-[13.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
        />
        {canListen && (
          <button
            type="button"
            onClick={onMic}
            disabled={disabled}
            aria-pressed={listening}
            aria-label={listening ? "Stop listening" : "Speak"}
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:opacity-40 ${
              listening
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-white/80 bg-white/70 text-gray-500 shadow-soft-xs hover:text-red-600"
            }`}
          >
            {listening && !reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-lg ring-2 ring-red-400"
                animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <FiMic className="relative h-4 w-4" />
          </button>
        )}
        {loading ? (
          <motion.button
            type="button"
            onClick={onStop}
            aria-label="Stop"
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 520, damping: 26 }}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/80 bg-white/75 text-red-700 shadow-soft-xs transition-colors hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
          >
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-1 rounded-md border-2 border-red-200 border-t-red-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
            <FiSquare className="relative h-3 w-3 fill-current" />
          </motion.button>
        ) : (
          <motion.button
            type="submit"
            disabled={disabled || !value.trim()}
            aria-label="Send"
            whileTap={reduce ? undefined : { scale: 0.88 }}
            className="soft-btn soft-btn-primary relative !h-9 !w-9 shrink-0 overflow-hidden !rounded-lg !p-0 disabled:opacity-40 disabled:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={sent}
                className="flex"
                initial={reduce ? { opacity: 0 } : { y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { y: -18, opacity: 0, scale: 0.8 }}
                transition={reduce ? { duration: 0.1 } : { type: "spring", stiffness: 500, damping: 28 }}
              >
                <FiArrowUp className="h-4 w-4" />
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </form>
  )
}
