import { motion, useReducedMotion } from "motion/react"

const base = { fill: "none", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" }
const RED = "#DC2626"
const GRAY = "#9CA3AF"

export function RulerSvg({ className = "", size = 20 }) {
  const reduce = useReducedMotion()
  const ticks = [6, 9, 12, 15, 18]
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      initial="rest" whileHover="hover" animate="rest" {...base}
    >
      <rect x="2" y="7" width="20" height="10" rx="2" stroke={GRAY} />
      <motion.rect
        x="3.5" y="8.5" width="17" height="3" rx="1" stroke="none" fill={RED} fillOpacity="0.25"
        style={{ transformOrigin: "3.5px 10px" }}
        variants={reduce ? {} : { rest: { scaleX: 0.6 }, hover: { scaleX: 1, transition: { duration: 0.4 } } }}
      />
      {ticks.map((x, i) => (
        <motion.line
          key={x} x1={x} y1="12.5" x2={x} y2={i % 2 ? "14.5" : "15.5"} stroke={RED}
          variants={reduce ? {} : { rest: { opacity: 0.5 }, hover: { opacity: 1, transition: { delay: i * 0.06 } } }}
        />
      ))}
    </motion.svg>
  )
}

export function TruckSvg({ className = "", size = 40 }) {
  const reduce = useReducedMotion()
  const spin = reduce ? {} : { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" } }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      {[16, 21, 26].map((y, i) => (
        <motion.line
          key={y} x1="7" y1={y} x2="2" y2={y} stroke={GRAY}
          animate={reduce ? undefined : { x: [0, -4, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      <path d="M10 14h18v18H10z" stroke={RED} />
      <path d="M28 20h8l5 6v6H28z" stroke={RED} />
      <motion.line
        x1="4" y1="38" x2="44" y2="38" stroke={GRAY} strokeDasharray="4 4"
        animate={reduce ? undefined : { strokeDashoffset: [0, -16] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      {[18, 35].map((cx) => (
        <motion.g key={cx} style={{ transformOrigin: `${cx}px 33px`, transformBox: "view-box" }} {...spin}>
          <circle cx={cx} cy="33" r="3.5" fill="#fff" stroke={RED} />
          <line x1={cx} y1="31" x2={cx} y2="35" stroke={GRAY} />
        </motion.g>
      ))}
    </svg>
  )
}

export function ShieldSvg({ className = "", size = 40 }) {
  const reduce = useReducedMotion()
  const draw = (delay, dur) => reduce
    ? {}
    : { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true }, transition: { duration: dur, delay, ease: "easeOut" } }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <motion.path
        d="M24 6l14 5v11c0 9-6 16-14 20C16 38 10 31 10 22V11z" fill={RED} stroke="none"
        animate={reduce ? { opacity: 0.08 } : { opacity: [0.04, 0.16, 0.04] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
      <motion.path d="M24 6l14 5v11c0 9-6 16-14 20C16 38 10 31 10 22V11z" stroke={RED} {...draw(0, 0.8)} />
      <motion.path d="M17 24l5 5 9-10" stroke={GRAY} {...draw(0.8, 0.4)} />
    </svg>
  )
}

export function ReturnsSvg({ className = "", size = 40 }) {
  const reduce = useReducedMotion()
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <motion.g
        style={{ transformOrigin: "24px 24px", transformBox: "view-box" }}
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
      >
        <path d="M24 9a15 15 0 1 1-15 15" stroke={RED} />
        <path d="M24 3l-5 6 5 6" stroke={RED} />
      </motion.g>
      <rect x="19" y="19" width="10" height="10" rx="2" stroke={GRAY} />
    </svg>
  )
}

export function HangerSvg({ className = "", size = 96 }) {
  const reduce = useReducedMotion()
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} aria-hidden="true" {...base}>
      <motion.g
        style={{ transformOrigin: "48px 8px", transformBox: "view-box" }}
        animate={reduce ? undefined : { rotate: [-6, 6, -6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M48 28v-6a7 7 0 1 0-7-7" stroke={GRAY} />
        <path d="M48 28L10 60h76z" stroke={RED} fill="#fff" />
        <circle cx="40" cy="50" r="1.6" fill={GRAY} stroke="none" />
        <circle cx="56" cy="50" r="1.6" fill={GRAY} stroke="none" />
        <path d="M40 57q8-5 16 0" stroke={GRAY} />
      </motion.g>
    </svg>
  )
}
