import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { FiChevronLeft, FiChevronRight, FiStar, FiZap } from "react-icons/fi";
import {
  floatingProducts,
  partnerLogos,
  showcaseCopy,
  stats,
  testimonials,
  trustBadges,
} from "./auth-data";

const safeId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, "");

/* Scoped keyframes. Prefix: dsx- */
const STYLES = `
@keyframes dsx-draw { 0%,15% { stroke-dashoffset: 30; } 45%,85% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -30; } }
@keyframes dsx-spin { to { transform: rotate(360deg); } }
@keyframes dsx-spin-rev { to { transform: rotate(-360deg); } }
@keyframes dsx-twinkle { 0%,100% { opacity: .15; transform: scale(.6); } 50% { opacity: 1; transform: scale(1); } }
@keyframes dsx-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes dsx-speed { 0% { transform: translateX(4px); opacity: 0; } 40% { opacity: 1; } 100% { transform: translateX(-6px); opacity: 0; } }
@keyframes dsx-pulse { 0%,100% { transform: scale(1); opacity: .5; } 50% { transform: scale(1.18); opacity: .15; } }
@keyframes dsx-marquee { to { transform: translateX(-50%); } }
@keyframes dsx-shine { 0% { transform: translateX(-120%) skewX(-20deg); } 60%,100% { transform: translateX(220%) skewX(-20deg); } }
@keyframes dsx-sway { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@keyframes dsx-steam { 0% { transform: translateY(2px) scale(.8); opacity: 0; } 50% { opacity: .9; } 100% { transform: translateY(-6px) scale(1.1); opacity: 0; } }
.dsx-draw { stroke-dasharray: 30; animation: dsx-draw 3.2s ease-in-out infinite; }
.dsx-spin { animation: dsx-spin 1.2s linear infinite; transform-box: fill-box; transform-origin: center; }
.dsx-spin-slow { animation: dsx-spin 9s linear infinite; transform-box: fill-box; transform-origin: center; }
.dsx-spin-rev { animation: dsx-spin-rev 3.6s cubic-bezier(.6,0,.3,1) infinite; transform-box: fill-box; transform-origin: center; }
.dsx-twinkle { animation: dsx-twinkle 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.dsx-bob { animation: dsx-bob 1.6s ease-in-out infinite; }
.dsx-speed { animation: dsx-speed 1.1s linear infinite; }
.dsx-pulse { animation: dsx-pulse 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.dsx-sway { animation: dsx-sway 3.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 0%; }
.dsx-steam { animation: dsx-steam 2.4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
.dsx-marquee-track { animation: dsx-marquee 26s linear infinite; }
.dsx-marquee:hover .dsx-marquee-track, .dsx-marquee:focus-within .dsx-marquee-track { animation-play-state: paused; }
.dsx-shine { animation: dsx-shine 4.5s ease-in-out infinite; }
.dsx-mask { -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
@media (prefers-reduced-motion: reduce) {
  .dsx-root *, .dsx-root *::before, .dsx-root *::after { animation: none !important; }
  .dsx-draw { stroke-dashoffset: 0; }
}
`;

/* ---------------- Trust badge marks (custom animated SVG) ---------------- */

function SecureMark({ uid }) {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sh`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill="#FEE2E2" className="dsx-pulse" />
      <path d="M16 4 L26 8 V15 C26 21 21.5 25.5 16 28 C10.5 25.5 6 21 6 15 V8 Z" fill={`url(#${uid}-sh)`} />
      <path d="M16 4 L26 8 V15 C26 21 21.5 25.5 16 28 Z" fill="#fff" opacity=".14" />
      <path d="M11 16 L14.6 19.4 L21 12.6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="dsx-draw" />
    </svg>
  );
}

function DeliveryMark({ uid }) {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-tr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EF4444" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
      <g className="dsx-speed">
        <rect x="1" y="11" width="5" height="1.6" rx=".8" fill="#FCA5A5" />
        <rect x="2" y="15" width="3.5" height="1.6" rx=".8" fill="#FECACA" />
      </g>
      <g className="dsx-bob">
        <rect x="7" y="9" width="14" height="11" rx="2.2" fill={`url(#${uid}-tr)`} />
        <path d="M21 12 H25.5 L29 16 V20 H21 Z" fill="#DC2626" />
        <path d="M22.4 13.4 H25 L27 16 H22.4 Z" fill="#FEE2E2" />
        <rect x="9" y="11" width="6" height="1.4" rx=".7" fill="#fff" opacity=".5" />
      </g>
      <g className="dsx-spin">
        <circle cx="12" cy="22" r="3" fill="#374151" />
        <rect x="11.5" y="19.6" width="1" height="4.8" fill="#D1D5DB" />
      </g>
      <g className="dsx-spin">
        <circle cx="24.5" cy="22" r="3" fill="#374151" />
        <rect x="24" y="19.6" width="1" height="4.8" fill="#D1D5DB" />
      </g>
    </svg>
  );
}

function ReturnsMark({ uid }) {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-rt`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <rect x="10" y="11" width="12" height="10" rx="2" fill="#FEE2E2" />
      <path d="M10 14 H22" stroke="#FCA5A5" strokeWidth="1.2" />
      <g className="dsx-spin-rev">
        <path d="M16 4 A12 12 0 0 1 28 16" fill="none" stroke={`url(#${uid}-rt)`} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M28 16 L30.5 12.5 M28 16 L24.6 13.8" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M16 28 A12 12 0 0 1 4 16" fill="none" stroke={`url(#${uid}-rt)`} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M4 16 L1.5 19.5 M4 16 L7.4 18.2" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function VerifiedMark({ uid }) {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-vf`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#B91C1C" />
        </radialGradient>
      </defs>
      <g className="dsx-spin-slow">
        {petals.map((a) => (
          <rect key={a} x="14" y="3" width="4" height="6" rx="2" fill="#FCA5A5" transform={`rotate(${a} 16 16)`} />
        ))}
      </g>
      <circle cx="16" cy="16" r="9" fill={`url(#${uid}-vf)`} />
      <path d="M12 16.2 L15 19 L20.4 13.2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="dsx-draw" />
      <path d="M27 4 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1 z" fill="#F87171" className="dsx-twinkle" />
      <circle cx="4.5" cy="26" r="1.3" fill="#FCA5A5" className="dsx-twinkle" style={{ animationDelay: ".9s" }} />
    </svg>
  );
}

const BADGE_MARKS = { secure: SecureMark, delivery: DeliveryMark, returns: ReturnsMark, verified: VerifiedMark };

function TrustBadge({ badge, index }) {
  const uid = safeId(useId());
  const Mark = BADGE_MARKS[badge.id];
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.08 * index, duration: 0.4 }}
      whileHover={{ y: -3 }}
      tabIndex={0}
      className="soft-card flex min-w-[11rem] shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 outline-none focus-visible:ring-4 focus-visible:ring-red-100 lg:min-w-0"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
        <Mark uid={uid} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-gray-900">{badge.title}</span>
        <span className="block truncate text-[11px] text-gray-500">{badge.text}</span>
      </span>
    </motion.li>
  );
}

/* ---------------- Count-up stats ---------------- */

function formatStat(n, decimals) {
  if (decimals > 0) return n.toFixed(decimals);
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 100 ? Math.round(k) : k.toFixed(k % 1 === 0 ? 0 : 1)}K`;
  }
  return Math.round(n).toString();
}

function StatCounter({ stat, reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [val, setVal] = useState(reduce ? stat.value : 0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(0, stat.value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, reduce, stat.value]);

  return (
    <div ref={ref} className="soft-card relative overflow-hidden rounded-2xl px-3 py-2.5 text-center lg:text-left">
      <p className="text-base font-semibold tabular-nums text-gray-900 sm:text-lg">
        {formatStat(reduce ? stat.value : val, stat.decimals)}
        <span className="text-red-600">{stat.suffix}</span>
      </p>
      <p className="truncate text-[10px] text-gray-500 sm:text-[11px]">{stat.label}</p>
      <span
        aria-hidden="true"
        className="dsx-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
    </div>
  );
}

/* ---------------- Testimonial carousel ---------------- */

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar
          key={i}
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${i < rating ? "fill-red-500 text-red-500" : "text-gray-300"}`}
        />
      ))}
    </span>
  );
}

function TestimonialCarousel({ reduce }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const count = testimonials.length;

  useEffect(() => {
    if (paused || reduce) return undefined;
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % count);
    }, 5200);
    return () => clearInterval(t);
  }, [paused, reduce, count]);

  const go = (step) => {
    setDir(step);
    setIndex((i) => (i + step + count) % count);
  };

  const item = testimonials[index];
  const initials = item.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Customer reviews"
      className="soft-card relative overflow-hidden rounded-3xl p-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <svg aria-hidden="true" viewBox="0 0 40 32" className="absolute right-4 top-3 h-8 w-10 text-red-100">
        <path
          fill="currentColor"
          d="M0 32V19C0 8 6 1.5 16 0l1.5 4C11.5 6 9 10 9 14h7v18H0zm23 0V19C23 8 29 1.5 39 0l1 4c-6 2-8.5 6-8.5 10H40v18H23z"
        />
      </svg>
      <div className="relative min-h-[7.5rem]" aria-live={paused ? "polite" : "off"}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.figure
            key={item.id}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 28, rotate: dir * 1.5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -28, rotate: dir * -1.5 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-700 text-sm font-semibold text-white shadow-soft-red">
                {initials}
              </span>
              <figcaption className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-[11px] text-gray-500">
                  {item.city} · <span className="text-red-600">{item.tag}</span>
                </p>
              </figcaption>
              <span className="ml-auto pr-10">
                <Stars rating={item.rating} />
              </span>
            </div>
            <blockquote className="mt-3 text-[13px] leading-relaxed text-gray-600">"{item.quote}"</blockquote>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Show review ${i + 1}`}
              aria-current={i === index}
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setIndex(i);
              }}
              className="flex h-5 items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-red-100"
            >
              <motion.span
                layout
                className={`block h-1.5 rounded-full ${i === index ? "w-5 bg-red-600" : "w-1.5 bg-gray-300"}`}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => go(-1)} aria-label="Previous review" className="soft-icon-btn h-8 w-8">
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next review" className="soft-icon-btn h-8 w-8">
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Floating product cards (custom SVG scenes) ---------------- */

function BagArt({ uid }) {
  return (
    <svg viewBox="0 0 80 64" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
      <ellipse cx="40" cy="58" rx="22" ry="3" fill="#111827" opacity=".08" className="dsx-pulse" />
      <g className="dsx-sway">
        <path d="M30 22 C30 10 50 10 50 22" fill="none" stroke="#7F1D1D" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 22 H60 L56 54 H24 Z" fill={`url(#${uid}-b)`} />
        <path d="M20 22 H40 L38 54 H24 Z" fill="#fff" opacity=".12" />
        <rect x="34" y="32" width="12" height="7" rx="2" fill="#FEE2E2" />
      </g>
      <path d="M64 12 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1 z" fill="#F87171" className="dsx-twinkle" />
    </svg>
  );
}

function SneakerArt({ uid }) {
  return (
    <svg viewBox="0 0 80 64" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E5E7EB" />
        </linearGradient>
        <linearGradient id={`${uid}-sr`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EF4444" />
          <stop offset="1" stopColor="#991B1B" />
        </linearGradient>
      </defs>
      <ellipse cx="40" cy="56" rx="28" ry="3" fill="#111827" opacity=".08" className="dsx-pulse" />
      <g className="dsx-bob">
        <path d="M10 44 C10 34 18 30 26 26 L34 20 C38 24 44 28 52 32 C62 34 70 38 70 46 V48 H10 Z" fill={`url(#${uid}-s)`} stroke="#D1D5DB" />
        <path d="M30 30 C38 34 46 38 58 40" fill="none" stroke={`url(#${uid}-sr)`} strokeWidth="5" strokeLinecap="round" />
        <path d="M10 46 H70 V50 C70 52 68 53 66 53 H14 C12 53 10 52 10 50 Z" fill="#DC2626" />
        <path d="M36 24 l4 2 M39 22 l4 2 M42 20.5 l4 2" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <g className="dsx-speed">
        <rect x="2" y="30" width="6" height="1.6" rx=".8" fill="#FCA5A5" />
        <rect x="0" y="36" width="5" height="1.6" rx=".8" fill="#FECACA" />
      </g>
    </svg>
  );
}

function HeadphonesArt({ uid }) {
  return (
    <svg viewBox="0 0 80 64" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4B5563" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
      </defs>
      <ellipse cx="40" cy="58" rx="20" ry="3" fill="#111827" opacity=".08" className="dsx-pulse" />
      <path d="M22 36 C22 16 58 16 58 36" fill="none" stroke={`url(#${uid}-h)`} strokeWidth="4" strokeLinecap="round" />
      <rect x="16" y="32" width="12" height="18" rx="5" fill="#DC2626" />
      <rect x="52" y="32" width="12" height="18" rx="5" fill="#DC2626" />
      <rect x="18" y="34" width="4" height="12" rx="2" fill="#fff" opacity=".25" />
      <g fill="none" stroke="#F87171" strokeWidth="1.8" strokeLinecap="round">
        <path d="M68 34 q3 5 0 10" className="dsx-steam" />
        <path d="M72 30 q5 9 0 18" className="dsx-steam" style={{ animationDelay: ".8s" }} />
      </g>
      <circle cx="10" cy="20" r="2" fill="#FCA5A5" className="dsx-twinkle" style={{ animationDelay: ".4s" }} />
    </svg>
  );
}

const PRODUCT_ART = { bag: BagArt, sneaker: SneakerArt, headphones: HeadphonesArt };
const CARD_POS = [
  "left-0 top-2 -rotate-6",
  "left-1/2 top-10 -translate-x-1/2 rotate-2 z-10",
  "right-0 top-0 rotate-6",
];

function FloatingProduct({ product, i, px, py, reduce }) {
  const uid = safeId(useId());
  const Art = PRODUCT_ART[product.kind];
  const x = useTransform(px, (v) => v * product.depth);
  const y = useTransform(py, (v) => v * product.depth);
  return (
    <div className={`absolute w-[31%] max-w-[9.5rem] ${CARD_POS[i]}`}>
      <motion.div style={{ x, y }}>
        <motion.article
          animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, i % 2 ? 1.5 : -1.5, 0] }}
          transition={{ duration: 4.5 + i * 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          whileHover={{ scale: 1.05 }}
          className="soft-card overflow-hidden rounded-2xl p-2"
        >
          <div className="relative aspect-[5/4] rounded-xl bg-gray-100">
            <Art uid={uid} />
            <motion.span
              className="soft-badge soft-badge-sale absolute left-1.5 top-1.5 text-[10px]"
              animate={reduce ? undefined : { scale: [1, 1.12, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5 }}
            >
              {product.sale}
            </motion.span>
          </div>
          <p className="mt-1.5 truncate text-[11px] font-semibold text-gray-900">{product.name}</p>
          <p className="text-[11px] text-red-600">
            {product.price} <span className="text-[10px] text-gray-400 line-through">{product.was}</span>
          </p>
        </motion.article>
      </motion.div>
    </div>
  );
}

function FloatingProducts({ reduce }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 15 });
  const py = useSpring(my, { stiffness: 60, damping: 15 });

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative hidden h-44 lg:block"
      aria-label="Deals on DioBral"
      role="img"
    >
      {floatingProducts.map((p, i) => (
        <FloatingProduct key={p.id} product={p} i={i} px={px} py={py} reduce={reduce} />
      ))}
    </div>
  );
}

/* ---------------- Partner marquee ---------------- */

function PartnerMarquee() {
  const row = [...partnerLogos, ...partnerLogos];
  return (
    <div className="dsx-marquee dsx-mask overflow-hidden" aria-label="Brands on DioBral">
      <ul className="dsx-marquee-track flex w-max items-center gap-3">
        {row.map((logo, i) => (
          <li
            key={`${logo.id}-${i}`}
            aria-hidden={i >= partnerLogos.length ? "true" : undefined}
            className="soft-card flex h-11 w-24 shrink-0 items-center justify-center rounded-xl px-3"
          >
            <img
              src={logo.src}
              alt={i >= partnerLogos.length ? "" : logo.name}
              loading="lazy"
              className="max-h-6 max-w-full object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Showcase ---------------- */

export default function AuthShowcase({ variant = "login", className = "" }) {
  const reduce = useReducedMotion();
  const copy = showcaseCopy[variant] || showcaseCopy.login;

  return (
    <div className={`dsx-root flex w-full min-w-0 flex-col gap-3 lg:gap-4 ${className}`}>
      <style>{STYLES}</style>

      <div className="hidden lg:block">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-badge soft-badge-danger inline-flex items-center gap-1 text-xs"
        >
          <FiZap className="h-3 w-3" />
          {copy.eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-2xl font-semibold leading-tight text-gray-900 xl:text-3xl"
        >
          {copy.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 max-w-md text-sm text-gray-600"
        >
          {copy.subtitle}
        </motion.p>
      </div>

      <FloatingProducts reduce={reduce} />

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <StatCounter key={s.id} stat={s} reduce={reduce} />
        ))}
      </div>

      <div className="hidden lg:block">
        <TestimonialCarousel reduce={reduce} />
      </div>

      <ul
        aria-label="Why shop with DioBral"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0"
      >
        {trustBadges.map((b, i) => (
          <TrustBadge key={b.id} badge={b} index={i} />
        ))}
      </ul>

      <div className="hidden sm:block">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">{copy.highlight}</p>
        <PartnerMarquee />
      </div>
    </div>
  );
}

export { AuthShowcase };
