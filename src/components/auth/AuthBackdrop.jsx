import { useEffect, useId } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const safeId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, "");

/* Scoped keyframes. Prefix: dbk- */
const STYLES = `
@keyframes dbk-blob-a { 0%,100% { transform: translate3d(0,0,0) scale(1); } 33% { transform: translate3d(8%,6%,0) scale(1.08); } 66% { transform: translate3d(-4%,10%,0) scale(.94); } }
@keyframes dbk-blob-b { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-10%,-6%,0) scale(1.12); } }
@keyframes dbk-blob-c { 0%,100% { transform: translate3d(0,0,0) scale(1.05); } 50% { transform: translate3d(6%,-10%,0) scale(.92); } }
@keyframes dbk-float { 0%,100% { transform: translate3d(0,0,0) rotate(var(--r,0deg)); } 50% { transform: translate3d(0,-18px,0) rotate(calc(var(--r,0deg) + 8deg)); } }
@keyframes dbk-drift { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(14px,-10px,0); } }
@keyframes dbk-twinkle { 0%,100% { opacity: .1; transform: scale(.5); } 50% { opacity: .9; transform: scale(1); } }
@keyframes dbk-grid { to { transform: translate3d(28px,28px,0); } }
.dbk-blob { position: absolute; border-radius: 9999px; filter: blur(60px); will-change: transform; }
.dbk-a { animation: dbk-blob-a 22s ease-in-out infinite; }
.dbk-b { animation: dbk-blob-b 28s ease-in-out infinite; }
.dbk-c { animation: dbk-blob-c 25s ease-in-out infinite; }
.dbk-float { animation: dbk-float var(--d,9s) ease-in-out infinite; animation-delay: var(--delay,0s); will-change: transform; }
.dbk-drift { animation: dbk-drift 14s ease-in-out infinite; }
.dbk-twinkle { animation: dbk-twinkle var(--d,3s) ease-in-out infinite; animation-delay: var(--delay,0s); }
.dbk-dots { background-image: radial-gradient(rgba(156,163,175,.35) 1px, transparent 1.2px); background-size: 28px 28px; animation: dbk-grid 18s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .dbk-root *, .dbk-root *::before, .dbk-root *::after { animation: none !important; }
}
`;

function ShapeBag({ uid }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full">
      <defs>
        <linearGradient id={`${uid}-bag`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FCA5A5" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <path d="M17 16 C17 6 31 6 31 16" fill="none" stroke="#B91C1C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M9 16 H39 L36 42 H12 Z" fill={`url(#${uid}-bag)`} />
      <path d="M9 16 H24 L23 42 H12 Z" fill="#fff" opacity=".18" />
    </svg>
  );
}

function ShapeTag({ uid }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full">
      <defs>
        <linearGradient id={`${uid}-tag`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E5E7EB" />
        </linearGradient>
      </defs>
      <path d="M6 22 L22 6 H40 V24 L24 40 Z" fill={`url(#${uid}-tag)`} stroke="#FCA5A5" strokeWidth="1.5" />
      <circle cx="33" cy="13" r="3" fill="#F87171" />
      <path d="M17 25 l8 -8 M19 30 l9 -9" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShapeBox({ uid }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full">
      <defs>
        <linearGradient id={`${uid}-box`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3F4F6" />
          <stop offset="1" stopColor="#D1D5DB" />
        </linearGradient>
      </defs>
      <path d="M24 6 L42 14 V34 L24 42 L6 34 V14 Z" fill={`url(#${uid}-box)`} />
      <path d="M6 14 L24 22 L42 14 M24 22 V42" fill="none" stroke="#fff" strokeWidth="1.5" />
      <path d="M15 10 L33 18 V24" fill="none" stroke="#F87171" strokeWidth="3" />
    </svg>
  );
}

function ShapeCart() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full">
      <path d="M4 8 H11 L16 32 H38 L43 15 H13" fill="none" stroke="#F87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="16" y="18" width="22" height="10" rx="2" fill="#FEE2E2" />
      <circle cx="19" cy="39" r="3.2" fill="#DC2626" />
      <circle cx="35" cy="39" r="3.2" fill="#DC2626" />
    </svg>
  );
}

function ShapeCoin() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full">
      <circle cx="24" cy="24" r="18" fill="#FEE2E2" />
      <circle cx="24" cy="24" r="13" fill="none" stroke="#F87171" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M24 14 V34 M19 19 H27 a4 4 0 0 1 0 8 H19" fill="none" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

const SHAPES = [
  { C: ShapeBag, cls: "left-[6%] top-[12%] h-14 w-14", d: "10s", delay: "0s", r: "-12deg", depth: 26 },
  { C: ShapeTag, cls: "right-[8%] top-[16%] h-12 w-12", d: "12s", delay: "1.5s", r: "14deg", depth: 18 },
  { C: ShapeBox, cls: "left-[10%] bottom-[14%] h-16 w-16", d: "11s", delay: ".8s", r: "8deg", depth: 34 },
  { C: ShapeCart, cls: "right-[12%] bottom-[10%] h-14 w-14", d: "13s", delay: "2s", r: "-6deg", depth: 22 },
  { C: ShapeCoin, cls: "left-[46%] top-[6%] h-10 w-10 hidden sm:block", d: "9s", delay: "1s", r: "0deg", depth: 14 },
  { C: ShapeTag, cls: "left-[38%] bottom-[5%] h-9 w-9 hidden md:block", d: "10.5s", delay: "3s", r: "-20deg", depth: 12 },
];

const SPARKS = [
  { cls: "left-[22%] top-[30%]", d: "3s", delay: "0s" },
  { cls: "right-[24%] top-[40%]", d: "3.6s", delay: "1.1s" },
  { cls: "left-[60%] bottom-[22%]", d: "2.8s", delay: ".6s" },
  { cls: "left-[30%] bottom-[34%]", d: "4s", delay: "1.8s" },
  { cls: "right-[34%] top-[10%]", d: "3.3s", delay: "2.4s" },
];

function ParallaxShape({ shape, px, py }) {
  const uid = safeId(useId());
  const x = useTransform(px, (v) => v * shape.depth);
  const y = useTransform(py, (v) => v * shape.depth);
  const { C } = shape;
  return (
    <motion.div className={`absolute ${shape.cls}`} style={{ x, y }}>
      <div
        className="dbk-float h-full w-full opacity-70 drop-shadow-[0_10px_18px_rgba(17,24,39,0.10)]"
        style={{ "--d": shape.d, "--delay": shape.delay, "--r": shape.r }}
      >
        <C uid={uid} />
      </div>
    </motion.div>
  );
}

export default function AuthBackdrop({ className = "" }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 40, damping: 18 });
  const py = useSpring(my, { stiffness: 40, damping: 18 });
  const bx = useTransform(px, (v) => v * -30);
  const by = useTransform(py, (v) => v * -30);

  useEffect(() => {
    if (reduce || typeof window === "undefined") return undefined;
    if (window.matchMedia && !window.matchMedia("(pointer: fine)").matches) return undefined;
    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce, mx, my]);

  return (
    <div
      aria-hidden="true"
      className={`dbk-root pointer-events-none absolute inset-0 -z-0 overflow-hidden bg-gray-100 ${className}`}
    >
      <style>{STYLES}</style>

      {/* Mesh: white + gray-200 washes */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,#ffffff_0%,transparent_70%),radial-gradient(50%_60%_at_90%_90%,#e5e7eb_0%,transparent_70%),radial-gradient(40%_40%_at_80%_20%,#ffffff_0%,transparent_70%)]" />

      {/* Slow red-tinted blobs */}
      <motion.div className="absolute inset-0" style={{ x: bx, y: by }}>
        <div className="dbk-blob dbk-a -left-[10%] -top-[10%] h-[45vmax] w-[45vmax] bg-red-200/35" />
        <div className="dbk-blob dbk-b -right-[12%] top-[30%] h-[38vmax] w-[38vmax] bg-red-100/50" />
        <div className="dbk-blob dbk-c bottom-[-18%] left-[30%] h-[34vmax] w-[34vmax] bg-white/80" />
      </motion.div>

      {/* Drifting dot grid, faded at the edges */}
      <div className="absolute inset-0 [mask-image:radial-gradient(70%_70%_at_50%_50%,#000_30%,transparent_100%)]">
        <div className="dbk-dots absolute -inset-[28px]" />
      </div>

      {/* Soft ring outline */}
      <div className="dbk-drift absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2">
        <div className="h-full w-full rounded-full border border-white/80 shadow-[inset_0_0_80px_rgba(255,255,255,0.6)]" />
      </div>

      {/* Floating shopping shapes */}
      {SHAPES.map((s, i) => (
        <ParallaxShape key={i} shape={s} px={px} py={py} />
      ))}

      {/* Sparkles */}
      {SPARKS.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className={`dbk-twinkle absolute h-3 w-3 ${s.cls}`}
          style={{ "--d": s.d, "--delay": s.delay }}
        >
          <path d="M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8 Z" fill="#F87171" />
        </svg>
      ))}
    </div>
  );
}

export { AuthBackdrop };
