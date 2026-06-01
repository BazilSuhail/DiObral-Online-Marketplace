import { useEffect, useId } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const CSS = `
@keyframes lgart-twinkle { 0%,100% { opacity: .15; transform: scale(.55) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(45deg); } }
@keyframes lgart-spin { to { transform: rotate(360deg); } }
@keyframes lgart-glow { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
.lgart-spark { transform-box: fill-box; transform-origin: center; animation: lgart-twinkle 2.6s ease-in-out infinite; }
.lgart-spin { transform-box: fill-box; transform-origin: center; animation: lgart-spin 40s linear infinite; }
.lgart-spin-rev { transform-box: fill-box; transform-origin: center; animation: lgart-spin 28s linear infinite reverse; }
.lgart-glow { animation: lgart-glow 3.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .lgart-spark, .lgart-spin, .lgart-spin-rev, .lgart-glow { animation: none; }
}
`;

const SPARKS = [
  { x: 96, y: 60, s: 1, d: 0 },
  { x: 214, y: 128, s: 0.7, d: 0.6 },
  { x: 332, y: 52, s: 0.9, d: 1.2 },
  { x: 520, y: 118, s: 0.8, d: 0.3 },
  { x: 512, y: 300, s: 0.6, d: 1.6 },
  { x: 30, y: 352, s: 0.7, d: 0.9 },
  { x: 322, y: 262, s: 0.55, d: 2 },
];
const STAR = "M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z";

/**
 * "Welcome back" scene: a shopper waving beside a bag, a key in a lock and a door
 * that opens onto warm light. keyTurned turns the key, doorOpen swings the door.
 */
export default function LoginArt({ keyTurned = false, doorOpen = false, className = "" }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n) => `lgart-${uid}-${n}`;
  const url = (n) => `url(#${id(n)})`;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18 });
  const py = useSpring(my, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  const backX = useTransform(px, (v) => v * -8);
  const backY = useTransform(py, (v) => v * -6);
  const midX = useTransform(px, (v) => v * 4);
  const floatX = useTransform(px, (v) => v * 14);
  const floatY = useTransform(py, (v) => v * 10);
  const sparkX = useTransform(px, (v) => v * 22);
  const sparkY = useTransform(py, (v) => v * 16);
  const eyeX = useTransform(px, (v) => v * 2.6);
  const eyeY = useTransform(py, (v) => v * 2);

  // Helper: an infinite loop that collapses to nothing under reduced motion.
  const loop = (animate, duration, extra = {}) =>
    reduce ? {} : { animate, transition: { duration, repeat: Infinity, ease: "easeInOut", ...extra } };

  const fill = { transformBox: "fill-box", transformOrigin: "center" };

  return (
    <div className={`relative w-full ${className}`}>
      <style>{CSS}</style>
      <svg viewBox="0 0 560 440" className="w-full h-auto overflow-visible" role="img" aria-label="A shopper waving hello beside a shopping bag and an opening door">
        <defs>
          <radialGradient id={id("blob")} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#F9FAFB" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </radialGradient>
          <linearGradient id={id("door")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <radialGradient id={id("light")} cx="50%" cy="55%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FEF2F2" />
            <stop offset="100%" stopColor="#FECACA" />
          </radialGradient>
          <linearGradient id={id("spill")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FECACA" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FEE2E2" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id("hoodie")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id={id("bag")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F3F4F6" />
          </linearGradient>
          <linearGradient id={id("key")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id={id("trail")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FCA5A5" stopOpacity="0" />
            <stop offset="50%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.2" />
          </linearGradient>
          <filter id={id("shadow")} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#111827" floodOpacity="0.10" />
          </filter>
          <filter id={id("soft")} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#991B1B" floodOpacity="0.16" />
          </filter>
          <filter id={id("blur")}>
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Back layer: soft blob + rotating rings */}
        <motion.g style={{ x: backX, y: backY }}>
          <circle cx="280" cy="230" r="196" fill={url("blob")} />
          <circle className="lgart-spin" cx="280" cy="230" r="176" fill="none" stroke="#FECACA" strokeWidth="1.5" strokeDasharray="2 12" strokeLinecap="round" />
          <circle className="lgart-spin-rev" cx="280" cy="230" r="150" fill="none" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="30 18" strokeLinecap="round" />
        </motion.g>

        {/* Ground */}
        <ellipse cx="280" cy="398" rx="236" ry="20" fill="#E5E7EB" />

        <motion.g style={{ x: midX }}>
          {/* Light spill on the floor */}
          <motion.polygon
            points="364,392 476,392 556,432 300,432"
            fill={url("spill")}
            animate={doorOpen ? { opacity: 1 } : reduce ? { opacity: 0.4 } : { opacity: [0.25, 0.5, 0.25] }}
            transition={doorOpen ? { duration: 0.6 } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Welcome sign swinging above the door */}
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }} {...loop({ rotate: [-4, 4, -4] }, 4.5)}>
            <line x1="398" y1="62" x2="398" y2="80" stroke="#9CA3AF" strokeWidth="2" />
            <line x1="442" y1="62" x2="442" y2="80" stroke="#9CA3AF" strokeWidth="2" />
            <rect x="372" y="78" width="96" height="28" rx="9" fill="#FFFFFF" filter={url("shadow")} />
            <text x="420" y="97" textAnchor="middle" fontSize="12" fontWeight="600" letterSpacing="2" fill="#DC2626" fontFamily="Poppins, sans-serif">WELCOME</text>
          </motion.g>

          {/* Door frame */}
          <rect x="352" y="112" width="136" height="286" rx="12" fill="#FFFFFF" filter={url("shadow")} />
          <rect x="364" y="124" width="112" height="268" rx="6" fill={url("light")} />
          {/* warm glow inside the doorway */}
          <motion.circle
            cx="420" cy="250" r="60" fill="#FECACA" filter={url("blur")}
            animate={doorOpen ? { opacity: 1, scale: 1.4 } : { opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.7 }}
            style={fill}
          />
          <g className="lgart-glow">
            <path d="M420 160 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" fill="#F87171" opacity="0.7" />
            <circle cx="400" cy="210" r="2.5" fill="#FCA5A5" />
            <circle cx="446" cy="196" r="2" fill="#FCA5A5" />
          </g>

          {/* Door panel (hinged on the left) */}
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}
            animate={doorOpen ? { scaleX: 0.16, skewY: -8 } : reduce ? { scaleX: 1 } : { scaleX: [1, 0.93, 1], skewY: [0, -1.5, 0] }}
            transition={doorOpen ? { type: "spring", stiffness: 70, damping: 14 } : { duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
          >
            <rect x="364" y="124" width="112" height="268" rx="6" fill={url("door")} />
            <rect x="378" y="140" width="84" height="96" rx="8" fill="#FFFFFF" opacity="0.14" />
            <rect x="378" y="252" width="84" height="122" rx="8" fill="#000000" opacity="0.07" />
            <circle cx="456" cy="268" r="6" fill="#FEF2F2" />
            {/* Lock plate */}
            <rect x="444" y="284" width="24" height="34" rx="7" fill="#FEF2F2" filter={url("soft")} />
            <circle cx="456" cy="297" r="3.4" fill="#7F1D1D" />
            <path d="M454.6 299 h2.8 l1 8 h-4.8z" fill="#7F1D1D" />
            {/* Pulse ring around the lock */}
            <motion.circle
              cx="456" cy="301" r="16" fill="none" stroke="#FECACA" strokeWidth="2" style={fill}
              {...(reduce ? {} : { animate: { scale: [0.8, 1.5], opacity: [0.9, 0] }, transition: { duration: keyTurned ? 0.9 : 2.2, repeat: Infinity, ease: "easeOut" } })}
            />
            {/* Key: pivots on its tip in the keyhole */}
            <motion.g
              style={{ transformBox: "fill-box", transformOrigin: "100% 50%" }}
              animate={keyTurned ? { rotate: -90 } : reduce ? { rotate: 0 } : { rotate: [0, -10, 0, 0] }}
              transition={keyTurned ? { type: "spring", stiffness: 180, damping: 12 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <circle cx="424" cy="300" r="9" fill={url("key")} filter={url("soft")} />
              <circle cx="424" cy="300" r="3.6" fill="#FEF2F2" />
              <rect x="432" y="298" width="24" height="4.5" rx="2" fill={url("key")} />
              <rect x="444" y="302" width="3.5" height="5" rx="1" fill="#D97706" />
              <rect x="450" y="302" width="3.5" height="4" rx="1" fill="#D97706" />
            </motion.g>
          </motion.g>

          {/* "click" sparkle when the key turns */}
          <motion.path
            d={STAR}
            transform="translate(470 278)"
            fill="#F59E0B"
            initial={false}
            animate={keyTurned ? { opacity: [0, 1, 0.8], scale: [0.2, 1.3, 1] } : { opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.5 }}
            style={fill}
          />

          {/* Shopping bag */}
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} {...loop({ rotate: [-2.5, 2.5, -2.5] }, 3.8)}>
            {/* tag peeking out */}
            <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} {...loop({ y: [0, -6, 0], rotate: [-8, 4, -8] }, 2.6)}>
              <path d="M268 262 l18 4 -4 30 -22 -4 z" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="272" cy="272" r="2.5" fill="#FFFFFF" stroke="#F87171" />
            </motion.g>
            <path d="M246 306 C246 274 282 274 282 306" fill="none" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" />
            <path d="M226 302 L302 302 L310 392 L218 392 Z" fill={url("bag")} stroke="#E5E7EB" strokeWidth="1.5" strokeLinejoin="round" filter={url("shadow")} />
            <path d="M226 302 L302 302 L303 316 L225 316 Z" fill="#FEE2E2" />
            <circle cx="246" cy="309" r="2.6" fill="#DC2626" />
            <circle cx="282" cy="309" r="2.6" fill="#DC2626" />
            <motion.path
              d="M264 372 C246 360 242 346 252 340 C258 336 263 340 264 345 C265 340 270 336 276 340 C286 346 282 360 264 372 Z"
              fill="#EF4444"
              style={fill}
              {...loop({ scale: [1, 1.14, 1, 1.08, 1] }, 1.8)}
            />
          </motion.g>

          {/* Shopper avatar */}
          <g>
            <rect x="130" y="318" width="15" height="74" rx="7" fill="#374151" />
            <rect x="156" y="318" width="15" height="74" rx="7" fill="#4B5563" />
            <ellipse cx="136" cy="392" rx="15" ry="7" fill="#111827" />
            <ellipse cx="166" cy="392" rx="15" ry="7" fill="#1F2937" />
            {/* left arm, holding on */}
            <path d="M118 262 C104 288 102 312 108 330" fill="none" stroke="#EF4444" strokeWidth="15" strokeLinecap="round" />
            <circle cx="108" cy="334" r="8" fill="#F5C2A3" />
            {/* torso */}
            <path d="M112 336 C108 282 120 252 150 248 C180 252 192 282 188 336 Z" fill={url("hoodie")} />
            <path d="M138 252 L150 272 L162 252" fill="none" stroke="#FECACA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="132" y="300" width="36" height="20" rx="8" fill="#B91C1C" opacity="0.35" />
            {/* waving arm */}
            <motion.g
              style={{ transformBox: "fill-box", transformOrigin: "10% 95%" }}
              {...loop({ rotate: [0, -22, 6, -22, 0] }, 2.2, { repeatDelay: 0.6 })}
            >
              <path d="M182 266 C196 246 204 224 210 198" fill="none" stroke="#EF4444" strokeWidth="15" strokeLinecap="round" />
              <circle cx="211" cy="190" r="10" fill="#F5C2A3" />
              <path d="M205 183 l-2 -8 M211 181 v-9 M217 183 l2 -8" stroke="#F5C2A3" strokeWidth="4" strokeLinecap="round" />
            </motion.g>
            {/* neck + head */}
            <rect x="143" y="232" width="14" height="18" rx="6" fill="#EBB291" />
            <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} {...loop({ rotate: [-3, 3, -3] }, 4.4)}>
              <circle cx="150" cy="204" r="34" fill="#F5C2A3" />
              <path d="M116 202 C112 168 136 156 156 160 C176 162 190 176 184 196 C172 186 152 184 136 178 C130 188 124 196 116 202 Z" fill="#1F2937" />
              <circle cx="116" cy="210" r="6" fill="#EBB291" />
              <circle cx="184" cy="210" r="6" fill="#EBB291" />
              <circle cx="134" cy="220" r="5" fill="#FCA5A5" opacity="0.6" />
              <circle cx="166" cy="220" r="5" fill="#FCA5A5" opacity="0.6" />
              {/* eyes (blink + follow pointer) */}
              <motion.g style={fill} {...loop({ scaleY: [1, 1, 0.1, 1, 1] }, 4.5, { times: [0, 0.9, 0.94, 0.98, 1], ease: "linear" })}>
                <ellipse cx="139" cy="207" rx="5.5" ry="6.5" fill="#FFFFFF" />
                <ellipse cx="161" cy="207" rx="5.5" ry="6.5" fill="#FFFFFF" />
                <motion.g style={{ x: eyeX, y: eyeY }}>
                  <circle cx="139" cy="208" r="3.2" fill="#111827" />
                  <circle cx="161" cy="208" r="3.2" fill="#111827" />
                  <circle cx="140" cy="206.6" r="1" fill="#FFFFFF" />
                  <circle cx="162" cy="206.6" r="1" fill="#FFFFFF" />
                </motion.g>
              </motion.g>
              <path d="M141 222 Q150 231 159 222" fill="none" stroke="#7F1D1D" strokeWidth="2.6" strokeLinecap="round" />
            </motion.g>
          </g>

          {/* Draw-on trail from the waving hand to the door */}
          <motion.path
            d="M222 176 C 270 112, 340 120, 392 158"
            fill="none"
            stroke={url("trail")}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            {...(reduce ? {} : { animate: { pathLength: [0, 1, 1], opacity: [1, 1, 0] }, transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut", times: [0, 0.6, 1] } })}
          />
        </motion.g>

        {/* Floating clothes, tags and a coupon badge */}
        <motion.g style={{ x: floatX, y: floatY }}>
          {/* T-shirt */}
          <motion.g style={fill} {...loop({ y: [0, -12, 0], rotate: [-8, -2, -8] }, 5)}>
            <path d="M48 92 l18 -10 c4 6 16 6 20 0 l18 10 -8 16 -8 -4 v30 h-32 v-30 l-8 4z" fill="#FFFFFF" stroke="#FCA5A5" strokeWidth="1.5" strokeLinejoin="round" filter={url("shadow")} />
            <path d="M66 82 c4 6 16 6 20 0" fill="none" stroke="#F87171" strokeWidth="2" />
            <circle cx="76" cy="112" r="5" fill="#FEE2E2" />
          </motion.g>
          {/* Hanger with dress */}
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }} {...loop({ rotate: [-6, 6, -6] }, 4.2)}>
            <path d="M262 26 a6 6 0 1 1 6 6 v4" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
            <path d="M240 50 L268 36 L296 50 Z" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinejoin="round" />
            <path d="M252 50 h32 l-4 14 l14 34 h-52 l14 -34 z" fill={url("hoodie")} filter={url("soft")} />
            <path d="M256 70 h24" stroke="#FECACA" strokeWidth="2" strokeLinecap="round" />
          </motion.g>
          {/* Price tag */}
          <motion.g style={fill} {...loop({ y: [0, 10, 0], rotate: [12, 22, 12] }, 4.6, { delay: 0.5 })}>
            <path d="M318 180 h36 l12 14 -12 14 h-36 a6 6 0 0 1 -6 -6 v-16 a6 6 0 0 1 6 -6z" fill="#FFFFFF" stroke="#FECACA" strokeWidth="1.5" filter={url("shadow")} />
            <circle cx="354" cy="194" r="3" fill="#FCA5A5" />
            <text x="332" y="199" textAnchor="middle" fontSize="12" fontWeight="600" fill="#DC2626" fontFamily="Poppins, sans-serif">-30%</text>
          </motion.g>
          {/* Coupon badge, rotating */}
          <motion.g style={fill} {...loop({ rotate: 360 }, 18, { ease: "linear" })}>
            <path
              d="M54 196 l6 -7 3 9 9 -2 -2 9 9 3 -7 6 7 6 -9 3 2 9 -9 -2 -3 9 -6 -7 -6 7 -3 -9 -9 2 2 -9 -9 -3 7 -6 -7 -6 9 -3 -2 -9 9 2 3 -9z"
              fill="#DC2626"
              filter={url("soft")}
            />
            <circle cx="54" cy="213" r="11" fill="none" stroke="#FECACA" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="54" y="218" textAnchor="middle" fontSize="12" fontWeight="600" fill="#FFFFFF" fontFamily="Poppins, sans-serif">%</text>
          </motion.g>
          {/* Small sock-ish tag top right */}
          <motion.g style={fill} {...loop({ y: [0, -9, 0], x: [0, 4, 0] }, 3.6, { delay: 1 })}>
            <rect x="500" y="170" width="34" height="24" rx="8" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1.5" />
            <path d="M508 182 h18" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
          </motion.g>
        </motion.g>

        {/* Sparkles */}
        <motion.g style={{ x: sparkX, y: sparkY }}>
          {SPARKS.map((s, i) => (
            <g key={i} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
              <path className="lgart-spark" d={STAR} fill={i % 2 ? "#F87171" : "#FCA5A5"} style={{ animationDelay: `${s.d}s` }} />
            </g>
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
