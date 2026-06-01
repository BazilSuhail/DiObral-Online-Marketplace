import { useId, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

/*
 * SignupArt: hand-built "join us" scene.
 * A member ID card is assembled field by field (email, password, name, contact),
 * a pen signs it, clothing tags swing, a gift pops, a progress ring fills and
 * confetti bursts when the last step is done.
 *
 * Props:
 *  step       0..3 current wizard step (each lights a different part of the card)
 *  values     { email, password, fullName, contact } live form values (optional)
 *  celebrate  bool, fire confetti + full ring
 *  className  wrapper classes
 */

const R = {
  50: "#FEF2F2", 100: "#FEE2E2", 200: "#FECACA", 300: "#FCA5A5",
  400: "#F87171", 500: "#EF4444", 600: "#DC2626", 700: "#B91C1C",
};
const G = {
  50: "#F9FAFB", 100: "#F3F4F6", 200: "#E5E7EB", 300: "#D1D5DB",
  400: "#9CA3AF", 500: "#6B7280", 700: "#374151", 900: "#111827",
};

const RING_R = 30;
const RING_C = 2 * Math.PI * RING_R;

const trunc = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s || "");
const initials = (name) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

// deterministic confetti pieces
const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2 + (i % 3) * 0.35;
  const dist = 110 + ((i * 37) % 90);
  return {
    id: i,
    x: Math.cos(a) * dist,
    y: Math.sin(a) * dist * 0.75 - 40,
    rot: ((i * 67) % 360) - 180,
    color: [R[600], R[400], R[300], G[300], R[500], R[200]][i % 6],
    w: 5 + (i % 3) * 2,
    h: i % 4 === 0 ? 5 + (i % 3) * 2 : 3,
    round: i % 4 === 0,
    delay: (i % 7) * 0.03,
  };
});

const SPARKLES = [
  { x: 64, y: 52, s: 1, d: 0 },
  { x: 470, y: 176, s: 0.8, d: 0.6 },
  { x: 108, y: 384, s: 0.7, d: 1.2 },
  { x: 300, y: 36, s: 0.6, d: 1.8 },
  { x: 488, y: 392, s: 0.9, d: 0.9 },
  { x: 30, y: 250, s: 0.65, d: 2.2 },
];

const BUBBLES = [
  { x: 44, r: 5, d: 0, dur: 7 },
  { x: 150, r: 3.5, d: 2.5, dur: 8 },
  { x: 360, r: 4, d: 1, dur: 6.5 },
  { x: 500, r: 3, d: 3.5, dur: 9 },
];

const FIELDS = [
  { key: "email", label: "EMAIL", x: 112, y: 112, w: 156, row: 0 },
  { key: "password", label: "PASSWORD", x: 26, y: 168, w: 242, row: 1 },
  { key: "fullName", label: "FULL NAME", x: 112, y: 80, w: 156, row: 2 },
  { key: "contact", label: "CONTACT", x: 26, y: 202, w: 242, row: 3 },
];

export default function SignupArt({ step = 0, values = {}, celebrate = false, className = "" }) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9]/g, "");
  const id = (n) => `sua${uid}-${n}`;
  const reduce = useReducedMotion();

  // pointer parallax
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 80, damping: 18 });
  const sy = useSpring(py, { stiffness: 80, damping: 18 });
  const backX = useTransform(sx, (v) => v * -10);
  const backY = useTransform(sy, (v) => v * -8);
  const midX = useTransform(sx, (v) => v * 10);
  const midY = useTransform(sy, (v) => v * 8);
  const frontX = useTransform(sx, (v) => v * 22);
  const frontY = useTransform(sy, (v) => v * 16);
  const tilt = useTransform(sx, (v) => v * 3);

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  const loop = (animate, transition) =>
    reduce ? {} : { animate, transition: { repeat: Infinity, ease: "easeInOut", ...transition } };

  const doneCount = Math.min(4, step + (celebrate ? 1 : 0));
  const pct = doneCount / 4;
  const name = values.fullName || "";
  const ini = initials(name);
  const pwLen = Math.min((values.password || "").length, 14);

  const isFilled = (f) => f.row < step || (values[f.key] && values[f.key].length > 0) || (celebrate && f.row <= step);
  const nameLit = step >= 2 || name.length > 0;

  const display = useMemo(
    () => ({
      email: trunc(values.email, 24),
      fullName: trunc(values.fullName, 18),
      contact: trunc(values.contact, 22),
    }),
    [values.email, values.fullName, values.contact]
  );

  return (
    <div
      className={`sua-root relative w-full select-none ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
    >
      <style>{`
        .sua-root .sua-twinkle { animation: sua-twinkle 2.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .sua-root .sua-bubble { animation: sua-rise linear infinite; transform-box: fill-box; }
        .sua-root .sua-shimmer { animation: sua-shimmer 3.6s ease-in-out infinite; }
        .sua-root .sua-dash { animation: sua-dash 14s linear infinite; }
        @keyframes sua-twinkle { 0%,100% { opacity: .15; transform: scale(.55) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(45deg); } }
        @keyframes sua-rise { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .9; } 100% { transform: translateY(-300px); opacity: 0; } }
        @keyframes sua-shimmer { 0% { transform: translateX(-160px); } 60%,100% { transform: translateX(320px); } }
        @keyframes sua-dash { to { stroke-dashoffset: -240; } }
        @media (prefers-reduced-motion: reduce) {
          .sua-root .sua-twinkle, .sua-root .sua-bubble, .sua-root .sua-shimmer, .sua-root .sua-dash { animation: none; }
          .sua-root .sua-bubble { opacity: .5; }
        }
      `}</style>

      <svg viewBox="0 0 520 440" className="w-full h-auto overflow-visible" role="img">
        <defs>
          <radialGradient id={id("blob")} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor={G[100]} />
            <stop offset="100%" stopColor={G[200]} stopOpacity="0.6" />
          </radialGradient>
          <linearGradient id={id("band")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={R[500]} />
            <stop offset="100%" stopColor={R[700]} />
          </linearGradient>
          <linearGradient id={id("card")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor={G[50]} />
          </linearGradient>
          <linearGradient id={id("ring")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={R[400]} />
            <stop offset="100%" stopColor={R[700]} />
          </linearGradient>
          <linearGradient id={id("gift")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={R[500]} />
            <stop offset="100%" stopColor={R[700]} />
          </linearGradient>
          <linearGradient id={id("tag")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor={R[100]} />
          </linearGradient>
          <linearGradient id={id("shine")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <filter id={id("shadow")} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#111827" floodOpacity="0.12" />
          </filter>
          <filter id={id("soft")} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#DC2626" floodOpacity="0.22" />
          </filter>
          <filter id={id("blur")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <clipPath id={id("cardClip")}>
            <rect x="0" y="0" width="294" height="270" rx="22" />
          </clipPath>
          <clipPath id={id("avatarClip")}>
            <circle cx="58" cy="104" r="34" />
          </clipPath>
        </defs>

        {/* ---------- back layer ---------- */}
        <motion.g style={{ x: backX, y: backY }}>
          <motion.ellipse
            cx="260" cy="220" rx="215" ry="190"
            fill={`url(#${id("blob")})`}
            {...loop({ rx: [215, 225, 215], ry: [190, 182, 190] }, { duration: 9 })}
          />
          <motion.circle
            cx="410" cy="110" r="70" fill={R[100]} opacity="0.55" filter={`url(#${id("blur")})`}
            {...loop({ scale: [1, 1.18, 1], opacity: [0.45, 0.7, 0.45] }, { duration: 6 })}
          />
          <motion.circle
            cx="110" cy="330" r="60" fill={R[50]} filter={`url(#${id("blur")})`}
            {...loop({ scale: [1.1, 0.9, 1.1] }, { duration: 7 })}
          />
          <circle
            className="sua-dash" cx="260" cy="225" r="178" fill="none"
            stroke={G[300]} strokeWidth="1.5" strokeDasharray="4 10" strokeLinecap="round" opacity="0.7"
          />
          {/* dotted grid */}
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 4 }).map((__, c) => (
              <circle key={`${r}-${c}`} cx={438 + c * 14} cy={260 + r * 14} r="1.6" fill={G[300]} />
            ))
          )}
          {BUBBLES.map((b, i) => (
            <circle
              key={i} className="sua-bubble" cx={b.x} cy="430" r={b.r}
              fill={i % 2 ? R[200] : G[300]}
              style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.d}s` }}
            />
          ))}
        </motion.g>

        {/* ground shadow */}
        <motion.ellipse
          cx="262" cy="404" rx="150" ry="14" fill={G[900]} opacity="0.07"
          {...loop({ rx: [150, 136, 150], opacity: [0.07, 0.05, 0.07] }, { duration: 5 })}
        />

        {/* ---------- progress ring (top right) ---------- */}
        <motion.g style={{ x: midX, y: midY }}>
          <g transform="translate(436 74)">
            <circle r="44" fill="#FFFFFF" filter={`url(#${id("shadow")})`} />
            <motion.circle
              r="40" fill="none" stroke={R[200]} strokeWidth="1.5" strokeDasharray="3 7" strokeLinecap="round"
              {...loop({ rotate: 360 }, { duration: 16, ease: "linear" })}
            />
            <circle r={RING_R} fill="none" stroke={G[200]} strokeWidth="7" />
            <motion.circle
              r={RING_R} fill="none" stroke={`url(#${id("ring")})`} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={RING_C}
              transform="rotate(-90)"
              initial={{ strokeDashoffset: RING_C }}
              animate={{ strokeDashoffset: RING_C * (1 - Math.max(pct, 0.03)) }}
              transition={{ type: "spring", stiffness: 60, damping: 16 }}
            />
            <text textAnchor="middle" y="4" fontSize="14" fontWeight="600" fill={G[900]}>
              {Math.round(pct * 100)}%
            </text>
            <text textAnchor="middle" y="17" fontSize="7" fontWeight="500" fill={G[400]} letterSpacing="1">
              DONE
            </text>
          </g>
        </motion.g>

        {/* ---------- hanging clothing tag (left) ---------- */}
        <motion.g style={{ x: midX, y: midY }}>
          <path d="M70 0 C 72 30, 64 50, 66 74" stroke={G[300]} strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
          <motion.g
            style={{ originX: 0.5, originY: 0 }}
            {...loop({ rotate: [-9, 9, -9] }, { duration: 3.4 })}
          >
            <g filter={`url(#${id("shadow")})`}>
              <path
                d="M66 74 L90 96 L90 160 Q90 168 82 168 L50 168 Q42 168 42 160 L42 96 Z"
                fill={`url(#${id("tag")})`} stroke={R[200]} strokeWidth="1.2"
              />
            </g>
            <circle cx="66" cy="96" r="4" fill="#FFFFFF" stroke={R[300]} strokeWidth="1.5" />
            <text x="66" y="130" textAnchor="middle" fontSize="18" fontWeight="600" fill={R[600]}>%</text>
            <rect x="52" y="140" width="28" height="4" rx="2" fill={R[200]} />
            <rect x="56" y="150" width="20" height="3" rx="1.5" fill={G[300]} />
          </motion.g>
        </motion.g>

        {/* ---------- main ID card ---------- */}
        <motion.g style={{ x: midX, y: midY }}>
          <motion.g {...loop({ y: [-6, 6, -6] }, { duration: 5.5 })}>
            <motion.g style={{ rotate: tilt }}>
              <g transform="translate(113 92)">
                <rect width="294" height="270" rx="22" fill={`url(#${id("card")})`} filter={`url(#${id("shadow")})`} />
                <rect width="294" height="270" rx="22" fill="none" stroke={G[200]} strokeWidth="1" />

                <g clipPath={`url(#${id("cardClip")})`}>
                  {/* header band */}
                  <rect width="294" height="56" fill={`url(#${id("band")})`} />
                  <circle cx="270" cy="-6" r="46" fill="#FFFFFF" opacity="0.08" />
                  <circle cx="232" cy="58" r="30" fill="#FFFFFF" opacity="0.06" />
                  {/* shimmer sweep */}
                  <rect className="sua-shimmer" x="0" y="0" width="80" height="270" fill={`url(#${id("shine")})`} transform="skewX(-20)" opacity="0.6" />
                </g>

                <g transform="translate(22 18)">
                  <rect width="22" height="22" rx="7" fill="#FFFFFF" opacity="0.95" />
                  <path d="M6 9 L16 9 L15 17 L7 17 Z" fill={R[600]} />
                  <path d="M8.5 9 Q11 4 13.5 9" fill="none" stroke={R[600]} strokeWidth="1.6" />
                  <text x="32" y="11" fontSize="10" fontWeight="600" fill="#FFFFFF" letterSpacing="1.4">DIOBRAL</text>
                  <text x="32" y="21" fontSize="7" fontWeight="500" fill={R[100]} letterSpacing="1.2">MEMBER ID</text>
                </g>

                {/* hologram chip */}
                <motion.g
                  {...loop({ rotate: 360 }, { duration: 10, ease: "linear" })}
                >
                  <circle cx="258" cy="28" r="12" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.5" strokeDasharray="5 3" />
                  <circle cx="258" cy="28" r="5" fill="#FFFFFF" opacity="0.85" />
                </motion.g>

                {/* avatar */}
                <g clipPath={`url(#${id("avatarClip")})`}>
                  <motion.circle
                    cx="58" cy="104" r="34"
                    animate={{ fill: nameLit ? R[100] : G[100] }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.g
                    animate={{ y: nameLit ? 0 : 6, opacity: nameLit ? 1 : 0.55 }}
                    transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  >
                    <circle cx="58" cy="96" r="12" fill={nameLit ? R[400] : G[300]} />
                    <path d="M32 140 Q34 114 58 114 Q82 114 84 140 Z" fill={nameLit ? R[500] : G[300]} />
                  </motion.g>
                  {ini && (
                    <text x="58" y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill="#FFFFFF">{ini}</text>
                  )}
                </g>
                <motion.circle
                  cx="58" cy="104" r="36" fill="none" stroke={R[400]} strokeWidth="2"
                  initial={false}
                  animate={step === 2 ? (reduce ? { opacity: 1 } : { opacity: [0.3, 1, 0.3], r: [36, 39, 36] }) : { opacity: 0 }}
                  transition={step === 2 && !reduce ? { duration: 1.8, repeat: Infinity } : { duration: 0.3 }}
                />

                {/* fields */}
                {FIELDS.map((f) => {
                  const active = step === f.row;
                  const filled = isFilled(f);
                  const val = f.key === "password" ? "" : display[f.key];
                  return (
                    <g key={f.key}>
                      <text x={f.x} y={f.y - 6} fontSize="7" fontWeight="600" letterSpacing="1.1" fill={active ? R[600] : G[400]}>
                        {f.label}
                      </text>
                      <rect x={f.x} y={f.y} width={f.w} height="16" rx="8" fill={G[100]} />
                      <motion.rect
                        x={f.x} y={f.y} height="16" rx="8"
                        fill={active ? R[100] : R[50]}
                        initial={false}
                        animate={{ width: filled || active ? f.w : 0 }}
                        transition={{ type: "spring", stiffness: 70, damping: 16 }}
                      />
                      {f.key === "password" &&
                        Array.from({ length: pwLen }).map((_, i) => (
                          <motion.circle
                            key={i} cx={f.x + 12 + i * 11} cy={f.y + 8} r="3" fill={R[500]}
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 14 }}
                          />
                        ))}
                      {val ? (
                        <text x={f.x + 10} y={f.y + 11.5} fontSize="8.5" fontWeight="500" fill={G[700]}>{val}</text>
                      ) : null}
                      {active && (
                        <motion.rect
                          x={f.x - 3} y={f.y - 3} width={f.w + 6} height="22" rx="11"
                          fill="none" stroke={R[400]} strokeWidth="1.5"
                          initial={{ opacity: 0 }}
                          animate={reduce ? { opacity: 1 } : { opacity: [0.35, 1, 0.35] }}
                          transition={reduce ? {} : { duration: 1.6, repeat: Infinity }}
                        />
                      )}
                      <AnimatePresence>
                        {filled && !active && (
                          <motion.g
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 15 }}
                          >
                            <circle cx={f.x + f.w - 9} cy={f.y + 8} r="6" fill={R[600]} />
                            <path
                              d={`M${f.x + f.w - 12} ${f.y + 8} l2.2 2.2 l4 -4.2`}
                              fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                            />
                          </motion.g>
                        )}
                      </AnimatePresence>
                    </g>
                  );
                })}

                {/* signature area */}
                <line x1="26" y1="252" x2="180" y2="252" stroke={G[300]} strokeWidth="1" strokeDasharray="2 3" />
                <text x="26" y="263" fontSize="6.5" fontWeight="500" letterSpacing="1" fill={G[400]}>SIGNATURE</text>
                <motion.path
                  d="M30 246 C 40 226, 50 252, 58 238 S 72 226, 76 242 S 92 250, 100 234 C 106 226, 112 246, 120 240 S 140 232, 168 238"
                  fill="none" stroke={R[600]} strokeWidth="2" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={
                    reduce
                      ? { pathLength: 1 }
                      : { pathLength: [0, 1, 1, 0], opacity: [1, 1, 1, 0] }
                  }
                  transition={reduce ? { duration: 0 } : { duration: 4.2, times: [0, 0.55, 0.9, 1], repeat: Infinity, ease: "easeInOut" }}
                />

                {/* stamp */}
                <motion.g
                  initial={false}
                  animate={{ scale: celebrate ? 1 : 0, rotate: celebrate ? -12 : -40, opacity: celebrate ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 12 }}
                >
                  <circle cx="246" cy="236" r="22" fill="none" stroke={R[600]} strokeWidth="2" />
                  <circle cx="246" cy="236" r="17" fill="none" stroke={R[600]} strokeWidth="1" strokeDasharray="2 2" />
                  <text x="246" y="239" textAnchor="middle" fontSize="8" fontWeight="600" fill={R[600]} letterSpacing="1">JOINED</text>
                </motion.g>
              </g>
            </motion.g>
          </motion.g>
        </motion.g>

        {/* ---------- pen (front layer) ---------- */}
        <motion.g style={{ x: frontX, y: frontY }}>
          <motion.g
            {...loop(
              { x: [0, 26, 52, 80, 110, 0], y: [0, -10, 4, -6, 0, 0], rotate: [0, -6, 4, -4, 0, 0] },
              { duration: 4.2, times: [0, 0.14, 0.28, 0.42, 0.55, 1] }
            )}
          >
            <g transform="translate(140 336) rotate(-38)">
              <g filter={`url(#${id("soft")})`}>
                <rect x="-5" y="-78" width="10" height="64" rx="5" fill={R[600]} />
              </g>
              <rect x="-5" y="-78" width="10" height="12" rx="5" fill={R[700]} />
              <rect x="-6" y="-34" width="12" height="7" rx="2" fill={G[300]} />
              <path d="M-5 -14 L5 -14 L0 0 Z" fill={G[700]} />
              <rect x="3" y="-70" width="2.2" height="34" rx="1.1" fill="#FFFFFF" opacity="0.5" />
            </g>
          </motion.g>
        </motion.g>

        {/* ---------- gift (bottom right) ---------- */}
        <motion.g style={{ x: frontX, y: frontY }}>
          <g transform="translate(418 322)">
            <ellipse cx="0" cy="56" rx="38" ry="6" fill={G[900]} opacity="0.08" />
            <g filter={`url(#${id("soft")})`}>
              <rect x="-32" y="0" width="64" height="54" rx="10" fill={`url(#${id("gift")})`} />
            </g>
            <rect x="-6" y="0" width="12" height="54" fill={R[100]} />
            <rect x="-26" y="6" width="6" height="40" rx="3" fill="#FFFFFF" opacity="0.18" />
            {/* items popping out */}
            <motion.g {...loop({ y: [0, -26, -26, 0], opacity: [0, 1, 1, 0] }, { duration: 3, times: [0, 0.35, 0.75, 1] })}>
              <path d="M-14 -4 C -18 -16, -4 -18, -6 -8 C -2 -18, 12 -14, 4 -2 Z" fill={R[400]} />
              <g transform="translate(14 -10) rotate(16)">
                <path d="M-6 -8 L6 -8 L8 8 L-8 8 Z" fill="#FFFFFF" stroke={R[300]} strokeWidth="1.2" />
                <path d="M-3 -8 Q0 -14 3 -8" fill="none" stroke={R[400]} strokeWidth="1.2" />
              </g>
            </motion.g>
            {/* lid */}
            <motion.g
              style={{ originX: 0, originY: 1 }}
              {...loop({ y: [0, -16, -16, 0], rotate: [0, -14, -14, 0] }, { duration: 3, times: [0, 0.3, 0.75, 1] })}
            >
              <rect x="-37" y="-12" width="74" height="16" rx="7" fill={R[700]} />
              <rect x="-6" y="-12" width="12" height="16" fill={R[200]} />
              <path d="M0 -12 C -18 -32, -26 -12, 0 -12 C 26 -12, 18 -32, 0 -12 Z" fill={R[200]} stroke={R[300]} strokeWidth="1" />
            </motion.g>
          </g>
        </motion.g>

        {/* ---------- small price tag (right) ---------- */}
        <motion.g style={{ x: frontX, y: frontY }}>
          <motion.g
            style={{ originX: 0.3, originY: 0.5 }}
            {...loop({ rotate: [8, -10, 8], y: [0, -4, 0] }, { duration: 4 })}
          >
            <g filter={`url(#${id("shadow")})`}>
              <path d="M458 226 L476 208 L506 208 Q512 208 512 214 L512 238 Q512 244 506 244 L476 244 Z" fill="#FFFFFF" stroke={G[200]} />
            </g>
            <circle cx="474" cy="226" r="3" fill={G[200]} />
            <rect x="484" y="219" width="20" height="4" rx="2" fill={R[500]} />
            <rect x="484" y="228" width="14" height="3" rx="1.5" fill={G[300]} />
          </motion.g>
        </motion.g>

        {/* ---------- heart badge (left low) ---------- */}
        <motion.g style={{ x: frontX, y: frontY }}>
          <motion.g {...loop({ y: [0, -10, 0], rotate: [-6, 6, -6] }, { duration: 4.6 })}>
            <circle cx="62" cy="300" r="22" fill="#FFFFFF" filter={`url(#${id("shadow")})`} />
            <motion.path
              d="M62 310 C 50 301, 50 290, 57 289 C 60 288.5, 62 291, 62 293 C 62 291, 64 288.5, 67 289 C 74 290, 74 301, 62 310 Z"
              fill={R[500]}
              {...loop({ scale: [1, 1.18, 1, 1.12, 1] }, { duration: 1.6 })}
            />
          </motion.g>
        </motion.g>

        {/* ---------- sparkles ---------- */}
        {SPARKLES.map((s, i) => (
          <path
            key={i}
            className="sua-twinkle"
            d={`M${s.x} ${s.y - 9 * s.s} Q${s.x + 1.5 * s.s} ${s.y - 1.5 * s.s} ${s.x + 9 * s.s} ${s.y} Q${s.x + 1.5 * s.s} ${s.y + 1.5 * s.s} ${s.x} ${s.y + 9 * s.s} Q${s.x - 1.5 * s.s} ${s.y + 1.5 * s.s} ${s.x - 9 * s.s} ${s.y} Q${s.x - 1.5 * s.s} ${s.y - 1.5 * s.s} ${s.x} ${s.y - 9 * s.s} Z`}
            fill={i % 2 ? R[400] : R[300]}
            style={{ animationDelay: `${s.d}s` }}
          />
        ))}

        {/* ---------- confetti ---------- */}
        <AnimatePresence>
          {celebrate && (
            <motion.g key="confetti" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {CONFETTI.map((c) =>
                c.round ? (
                  <motion.circle
                    key={c.id} cx="260" cy="150" r={c.w / 2} fill={c.color}
                    initial={{ x: 0, y: 0, scale: 0 }}
                    animate={reduce ? { x: c.x, y: c.y, scale: 1 } : { x: [0, c.x, c.x * 1.1], y: [0, c.y, c.y + 140], scale: [0, 1, 0.8], opacity: [1, 1, 0] }}
                    transition={reduce ? { duration: 0 } : { duration: 2.4, delay: c.delay, ease: "easeOut", repeat: Infinity, repeatDelay: 0.8 }}
                  />
                ) : (
                  <motion.rect
                    key={c.id} x="260" y="150" width={c.w} height={c.h} rx="1" fill={c.color}
                    initial={{ x: 0, y: 0, rotate: 0, scale: 0 }}
                    animate={reduce ? { x: c.x, y: c.y, scale: 1, rotate: c.rot } : { x: [0, c.x, c.x * 1.1], y: [0, c.y, c.y + 140], rotate: [0, c.rot, c.rot * 2], scale: [0, 1, 0.8], opacity: [1, 1, 0] }}
                    transition={reduce ? { duration: 0 } : { duration: 2.4, delay: c.delay, ease: "easeOut", repeat: Infinity, repeatDelay: 0.8 }}
                  />
                )
              )}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
