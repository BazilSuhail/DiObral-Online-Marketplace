/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react"
import { motion, useAnimationControls } from "motion/react"

// "Swarm" orb: a rotating Fibonacci sphere of particles on a 2D canvas, themed red / rose / graphite.
//   idle      - slow spin, breathing
//   listening - surface ripples with the live mic level, spikes around the rim
//   thinking  - particles collapse onto a fast tilted ring with deep crimson / rose comet tails
//   speaking  - sphere returns, each spoken word sends a ripple pole to pole
//   error     - dark red, jittery, sags under "gravity" for a moment
// Tuned for a light glass panel: saturated cores keep contrast on white, and the front
// layers get a cheap additive ("lighter") halo pass so they glow without washing out.

const TAU = Math.PI * 2
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const BUCKETS = 6
const GRAY = [222, 170, 182] // dusty rose, back particles mix toward this (reads on white glass)

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

// numeric shape params (eased by dt*5) + colors (lerped the same way)
const STATES = {
  idle: { radius: 0.62, spin: 0.25, jitter: 0, ring: 0, gravity: 0, breathe: 0.03, core: hex("#DC2626"), edge: hex("#FB7185"), glow: [225, 29, 72, 0.22] },
  listening: { radius: 0.6, spin: 0.5, jitter: 0, ring: 0, gravity: 0, breathe: 0.03, core: hex("#E11D48"), edge: hex("#FDA4AF"), glow: [244, 63, 94, 0.32] },
  thinking: { radius: 0.56, spin: 2.6, jitter: 0, ring: 1, gravity: 0, breathe: 0.03, core: hex("#B91C1C"), edge: hex("#F43F5E"), glow: [190, 18, 60, 0.2] },
  speaking: { radius: 0.64, spin: 0.7, jitter: 0, ring: 0, gravity: 0, breathe: 0.03, core: hex("#E11D48"), edge: hex("#FB7185"), glow: [225, 29, 72, 0.34] },
  error: { radius: 0.58, spin: 0.2, jitter: 0.06, ring: 0, gravity: 0.25, breathe: 0.03, core: hex("#7F1D1D"), edge: hex("#9F1239"), glow: [127, 29, 29, 0.16] },
}
const NUM_KEYS = ["radius", "spin", "jitter", "ring", "gravity", "breathe"]

const cloneState = (s) => ({ ...s, core: [...s.core], edge: [...s.edge], glow: [...s.glow] })

function makeParticles(n) {
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n
    const r = Math.sqrt(1 - y * y)
    const a = i * GOLDEN
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r, seed: Math.random() * 1000, ringA: (i / n) * TAU }
  })
}

const mix = (a, b, t) => a + (b - a) * t
const rgb = (c, alpha) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${alpha})`

export default function OrbCanvas({
  state = "idle",
  size = 220,
  levelRef,
  kickRef,
  active = true,
  quality = "high",
  reducedMotion = false,
  className = "",
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state
  const activeRef = useRef(active)
  activeRef.current = active
  const api = useRef({ sync: () => {}, wake: () => {} })
  const controls = useAnimationControls()
  const firstState = useRef(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext("2d")
    const small = size < 90
    const low = quality === "low" || small
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 1.5)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const count = low ? 48 : window.innerWidth < 640 || (navigator.hardwareConcurrency || 8) <= 4 ? 110 : 160
    const particles = makeParticles(count)
    const cur = cloneState(STATES[stateRef.current] || STATES.idle)
    const waves = []
    const buckets = Array.from({ length: BUCKETS }, () => [])
    const frameMs = quality === "low" ? 1000 / 30 : 1000 / 60 - 2

    // cached glow sprite, rebuilt only when its color drifts or the state target changes
    const glowCv = document.createElement("canvas")
    glowCv.width = glowCv.height = 64
    const gctx = glowCv.getContext("2d")
    let glowKey = ""
    const buildGlow = () => {
      const g = cur.glow
      const key = `${stateRef.current}:${Math.round(g[0] / 6)},${Math.round(g[1] / 6)},${Math.round(g[2] / 6)},${Math.round(g[3] * 50)}`
      if (key === glowKey) return
      glowKey = key
      gctx.clearRect(0, 0, 64, 64)
      const grad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      grad.addColorStop(0, rgb(g, g[3] * 1.6))
      grad.addColorStop(0.45, rgb(g, g[3] * 0.6))
      grad.addColorStop(1, rgb(g, 0))
      gctx.fillStyle = grad
      gctx.fillRect(0, 0, 64, 64)
    }

    let raf = 0
    let running = false
    let visible = true
    let sleeping = false
    let idleSince = 0
    let last = performance.now()
    let lastDraw = 0
    let t = 0
    let angle = 0
    let ringAngle = 0
    let level = 0

    const draw = (now, still) => {
      const dt = still ? 0.016 : Math.min((now - last) / 1000, 0.05)
      last = now
      t += dt

      const st = stateRef.current
      const target = STATES[st] || STATES.idle
      const k = still ? 1 : Math.min(1, dt * 5)
      for (const key of NUM_KEYS) cur[key] += (target[key] - cur[key]) * k
      for (let i = 0; i < 3; i++) {
        cur.core[i] += (target.core[i] - cur.core[i]) * k
        cur.edge[i] += (target.edge[i] - cur.edge[i]) * k
      }
      for (let i = 0; i < 4; i++) cur.glow[i] += (target.glow[i] - cur.glow[i]) * k
      angle += cur.spin * dt
      ringAngle += cur.spin * 1.4 * dt

      const mic = st === "listening" ? levelRef?.current || 0 : 0
      const voice = st === "speaking" && !still ? 0.25 + 0.25 * Math.sin(t * 9) * Math.sin(t * 3.3) : 0
      level += (Math.max(mic * 2.2, voice) - level) * Math.min(1, dt * 12)

      if (kickRef && kickRef.current > 0) {
        waves.push(t)
        kickRef.current = 0
      }
      while (waves.length && t - waves[0] > 1.1) waves.shift()

      const c = size / 2
      const R = c * cur.radius * (1 + Math.sin(t * 0.8) * cur.breathe + level * 0.12)
      ctx.clearRect(0, 0, size, size)

      buildGlow()
      ctx.globalAlpha = Math.min(1, 0.6 + level * 0.8)
      ctx.drawImage(glowCv, c - R * 1.6, c - R * 1.6, R * 3.2, R * 3.2)
      ctx.globalAlpha = 1

      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const tilt = 0.42
      const cosT = Math.cos(tilt)
      const sinT = Math.sin(tilt)
      const dotBase = small ? 0.85 : 1.5
      const tails = cur.ring > 0.3 && quality !== "low" && !small ? 4 : 0
      for (const b of buckets) b.length = 0

      for (const p of particles) {
        const n = Math.sin(p.seed + t * 3.1) * 0.5 + 0.5
        let bump = level * 0.45 * n + cur.jitter * Math.sin(p.seed * 7 + t * 40)
        for (const w of waves) {
          const front = (t - w) * 2.2
          const d = 1 - p.y - front
          bump += 0.16 * Math.exp(-d * d * 18) * (1 - (t - w) / 1.1)
        }
        const r = 1 + bump

        for (let j = tails; j >= 0; j--) {
          let x = (p.x * cosA - p.z * sinA) * r
          let z = (p.x * sinA + p.z * cosA) * r
          let y = p.y * r
          if (cur.ring > 0.001) {
            const a = p.ringA + ringAngle - j * 0.07
            const rr = 1.05 + Math.sin(p.seed) * 0.06
            x += (Math.cos(a) * rr - x) * cur.ring
            y += (Math.sin(p.seed * 3) * 0.05 - y) * cur.ring
            z += (Math.sin(a) * rr - z) * cur.ring
          } else if (j > 0) continue
          const y2 = y * cosT - z * sinT
          const z2 = y * sinT + z * cosT
          const depth = (z2 + 1.3) / 2.6
          const bi = Math.max(0, Math.min(BUCKETS - 1, Math.floor(depth * BUCKETS)))
          const rad = dotBase * (0.5 + depth) * (1 + level * 0.6) * (j ? 1 - j / (tails + 2) : 1)
          const arr = buckets[bi]
          arr.push(c + x * R, c - y2 * R + cur.gravity * R * (1 - p.y) * 0.5, Math.max(0.3, rad))
        }
      }

      for (let bi = 0; bi < BUCKETS; bi++) {
        const arr = buckets[bi]
        if (!arr.length) continue
        const depth = (bi + 0.5) / BUCKETS
        // ring particles go edge-colored, sphere particles core-colored; the back fades toward gray
        const e = Math.min(1, (1 - depth) * 0.55 + cur.ring * 0.6)
        const back = Math.max(0, 1 - depth) * 0.4
        const col = [0, 0, 0]
        for (let i = 0; i < 3; i++) col[i] = mix(mix(cur.core[i], cur.edge[i], e), GRAY[i], back)
        ctx.fillStyle = rgb(col, (0.2 + depth * 0.8).toFixed(2))
        ctx.beginPath()
        for (let i = 0; i < arr.length; i += 3) {
          ctx.moveTo(arr[i] + arr[i + 2], arr[i + 1])
          ctx.arc(arr[i], arr[i + 1], arr[i + 2], 0, TAU)
        }
        ctx.fill()
      }

      // additive halo on the two front layers only (one extra path each, skipped on low/small)
      if (!low) {
        ctx.globalCompositeOperation = "lighter"
        for (let bi = BUCKETS - 2; bi < BUCKETS; bi++) {
          const arr = buckets[bi]
          if (!arr.length) continue
          ctx.fillStyle = rgb(cur.edge, bi === BUCKETS - 1 ? 0.16 : 0.09)
          ctx.beginPath()
          for (let i = 0; i < arr.length; i += 3) {
            const hr = arr[i + 2] * 2.4
            ctx.moveTo(arr[i] + hr, arr[i + 1])
            ctx.arc(arr[i], arr[i + 1], hr, 0, TAU)
          }
          ctx.fill()
        }
        ctx.globalCompositeOperation = "source-over"
      }

      if (st === "listening" && !small && level > 0.02) {
        ctx.strokeStyle = "rgba(225,29,72,0.6)"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        for (let i = 0; i < 56; i++) {
          const a = (i / 56) * TAU + angle * 0.3
          const len = R * 0.35 * level * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.7 + t * 6)))
          ctx.moveTo(c + Math.cos(a) * R * 1.12, c + Math.sin(a) * R * 1.12)
          ctx.lineTo(c + Math.cos(a) * (R * 1.12 + len), c + Math.sin(a) * (R * 1.12 + len))
        }
        ctx.stroke()
      }
    }

    const frame = (now) => {
      raf = 0
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (now - lastDraw < frameMs) return
      lastDraw = now
      draw(now, false)
      // launcher orb: sleep after 6s of idle, wake on state change / hover
      if (quality === "low") {
        if (stateRef.current === "idle") {
          if (!idleSince) idleSince = now
          else if (now - idleSince > 6000) { sleeping = true; sync() }
        } else idleSince = 0
      }
    }

    function sync() {
      const should = !reducedMotion && activeRef.current && visible && !document.hidden && !sleeping
      if (should && !running) {
        running = true
        last = performance.now()
        lastDraw = 0
        idleSince = 0
        raf = requestAnimationFrame(frame)
      } else if (!should && running) {
        running = false
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const wake = () => {
      sleeping = false
      idleSince = 0
      if (reducedMotion) {
        const target = STATES[stateRef.current] || STATES.idle
        Object.assign(cur, cloneState(target))
        draw(performance.now(), true)
      } else sync()
    }
    api.current = { sync, wake }

    const io = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
      : null
    io?.observe(canvas)
    const onVis = () => sync()
    document.addEventListener("visibilitychange", onVis)

    if (reducedMotion) {
      Object.assign(cur, cloneState(STATES[stateRef.current] || STATES.idle))
      draw(performance.now(), true)
    } else {
      draw(performance.now(), true)
      sync()
    }

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io?.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      api.current = { sync: () => {}, wake: () => {} }
    }
  }, [size, quality, reducedMotion, levelRef, kickRef])

  // active prop flips pause / resume the loop
  useEffect(() => { api.current.sync() }, [active])

  // state change: wake the loop (or redraw the still frame) and give the wrapper a small pop
  useEffect(() => {
    api.current.wake()
    if (firstState.current) { firstState.current = false; return }
    if (!reducedMotion) controls.start({ scale: [1, 1.06, 1], transition: { duration: 0.3 } })
  }, [state, reducedMotion, controls])

  return (
    <motion.div
      animate={controls}
      onPointerEnter={() => api.current.wake()}
      style={{ width: size, height: size, display: "inline-block", lineHeight: 0 }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={className}
        style={{ width: size, height: size, display: "block" }}
      />
    </motion.div>
  )
}
