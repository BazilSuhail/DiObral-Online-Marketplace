const SPARK = "M0 -6 Q1 -1 6 0 Q1 1 0 6 Q-1 1 -6 0 Q-1 -1 0 -6Z";
const SHIRT =
  "M-14 -12 L-6 -16 Q0 -10 6 -16 L14 -12 L21 -3 L13 1 L12 16 Q12 18 10 18 H-10 Q-12 18 -12 16 L-13 1 L-21 -3 Z";
const SOCK = "M-5 -14 H5 V2 Q5 6 9 8 L13 10 Q17 13 14 17 Q12 19 8 18 L-1 14 Q-5 12 -5 6 Z";

export function NoBundles({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="No bundles available"
      className={`nb-root ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
.nb-root .nb-a{transform-box:fill-box;transform-origin:center}
.nb-root .nb-lid{animation:nb-lid 3.2s ease-in-out infinite}
.nb-root .nb-swing{transform-box:fill-box;transform-origin:0% 0%;animation:nb-swing 3.6s ease-in-out infinite}
.nb-root .nb-ghost{animation:nb-ghost 4.8s ease-in-out infinite}
.nb-root .nb-march{stroke-dasharray:4 4;animation:nb-march 3s linear infinite}
.nb-root .nb-spark{animation:nb-twinkle 2.6s ease-in-out infinite}
.nb-root .nb-glow{animation:nb-glow 3.2s ease-in-out infinite}
@keyframes nb-lid{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-9px) rotate(-5deg)}}
@keyframes nb-swing{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}
@keyframes nb-ghost{0%,100%{transform:translateY(0);opacity:.9}50%{transform:translateY(-7px);opacity:.5}}
@keyframes nb-march{to{stroke-dashoffset:-48}}
@keyframes nb-twinkle{0%,100%{opacity:.15;transform:scale(.4) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(30deg)}}
@keyframes nb-glow{0%,100%{opacity:.35}50%{opacity:.8}}
@media (prefers-reduced-motion: reduce){.nb-root *{animation:none!important}}
`}</style>
      <defs>
        <linearGradient id="nb-box" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EF4444" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
        <linearGradient id="nb-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EF4444" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <radialGradient id="nb-inner" cx=".5" cy=".5" r=".6">
          <stop offset="0" stopColor="#FEE2E2" />
          <stop offset="1" stopColor="#FEE2E2" stopOpacity="0" />
        </radialGradient>
        <filter id="nb-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* backdrop */}
      <circle cx="120" cy="100" r="82" fill="#F3F4F6" />
      <circle cx="176" cy="54" r="26" fill="#FEF2F2" />
      <circle cx="58" cy="150" r="20" fill="#FEF2F2" />

      {/* missing items (dashed ghosts) */}
      <g className="nb-a nb-ghost">
        <g transform="translate(50 108) rotate(-10)">
          <path className="nb-march" d={SHIRT} fill="#FFFFFF" fillOpacity=".7" stroke="#F87171" strokeWidth="2" strokeLinejoin="round" />
        </g>
      </g>
      <g className="nb-a nb-ghost" style={{ animationDelay: "-2.4s" }}>
        <g transform="translate(196 104) rotate(12)">
          <path className="nb-march" d={SOCK} fill="#FFFFFF" fillOpacity=".7" stroke="#9CA3AF" strokeWidth="2" strokeLinejoin="round" />
        </g>
      </g>

      {/* shadow */}
      <ellipse cx="120" cy="166" rx="50" ry="6" fill="#D1D5DB" opacity=".6" filter="url(#nb-blur)" />

      {/* glow from empty box */}
      <ellipse className="nb-glow" cx="120" cy="96" rx="34" ry="14" fill="url(#nb-inner)" />

      {/* box body */}
      <rect x="82" y="104" width="76" height="58" rx="6" fill="url(#nb-box)" />
      <path d="M140 104 H152 Q158 104 158 110 V156 Q158 162 152 162 H140 Z" fill="#B91C1C" opacity=".35" />
      <rect x="113" y="104" width="14" height="58" fill="#FEE2E2" />
      <rect x="86" y="101" width="68" height="7" rx="3" fill="#B91C1C" />
      <path d="M88 116 Q88 112 92 112" fill="none" stroke="#FECACA" strokeWidth="2" strokeLinecap="round" opacity=".7" />

      {/* gift tag */}
      <g className="nb-swing">
        <path d="M156 112 Q166 114 168 124" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        <g transform="translate(168 124)">
          <path d="M-7 0 L0 -5 L7 0 V14 Q7 16 5 16 H-5 Q-7 16 -7 14 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="0" cy="-1" r="1.5" fill="#D1D5DB" />
          <path d="M-3 6 H3 M-3 10 H1" stroke="#F87171" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      </g>

      {/* floating lid with bow */}
      <g className="nb-a nb-lid">
        <rect x="76" y="76" width="88" height="18" rx="5" fill="url(#nb-lid)" />
        <rect x="76" y="76" width="88" height="5" rx="2.5" fill="#F87171" opacity=".6" />
        <rect x="113" y="76" width="14" height="18" fill="#FEE2E2" />
        <path d="M120 76 C108 58 90 62 99 72 C103 76 112 76 120 76 Z" fill="#FEE2E2" stroke="#FECACA" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M120 76 C132 58 150 62 141 72 C137 76 128 76 120 76 Z" fill="#FEE2E2" stroke="#FECACA" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M104 68 Q108 66 112 70 M136 68 Q132 66 128 70" fill="none" stroke="#FECACA" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="120" cy="75" r="4.5" fill="#FECACA" />
      </g>

      {/* sparkles */}
      {[
        [100, 44, "#F87171", "0s"],
        [146, 40, "#FECACA", "-0.9s"],
        [64, 74, "#D1D5DB", "-1.6s"],
        [186, 148, "#F87171", "-2.1s"],
      ].map(([x, y, c, d]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path className="nb-a nb-spark" d={SPARK} fill={c} style={{ animationDelay: d }} />
        </g>
      ))}
    </svg>
  );
}

export default NoBundles;
