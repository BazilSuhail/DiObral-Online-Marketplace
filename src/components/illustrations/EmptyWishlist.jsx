const SPARK = "M0 -6 Q1 -1 6 0 Q1 1 0 6 Q-1 1 -6 0 Q-1 -1 0 -6Z";
const HEART =
  "M120 152 C96 138 86 124 88 112 C90 100 104 96 112 102 Q117 106 120 110 Q123 106 128 102 C136 96 150 100 152 112 C154 124 144 138 120 152 Z";
const MINI_HEART = "M0 6 C-6 2 -8 -2 -6 -5 C-4 -8 -1 -7 0 -4 C1 -7 4 -8 6 -5 C8 -2 6 2 0 6Z";

export function EmptyWishlist({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="Your wishlist is empty"
      className={`ew-root ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
.ew-root .ew-a{transform-box:fill-box;transform-origin:center}
.ew-root .ew-sway{transform-box:fill-box;transform-origin:50% 0%;animation:ew-sway 4.5s ease-in-out infinite}
.ew-root .ew-beat{animation:ew-beat 2.4s ease-in-out infinite}
.ew-root .ew-march{stroke-dasharray:4 3;animation:ew-march 4s linear infinite}
.ew-root .ew-rise{animation:ew-rise 4.2s ease-in-out infinite}
.ew-root .ew-spark{animation:ew-twinkle 2.8s ease-in-out infinite}
.ew-root .ew-shadow{animation:ew-shadow 4.5s ease-in-out infinite}
@keyframes ew-sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes ew-beat{0%,100%{transform:scale(.85)}15%{transform:scale(1.08)}30%{transform:scale(.92)}45%{transform:scale(1.02)}}
@keyframes ew-march{to{stroke-dashoffset:-70}}
@keyframes ew-rise{0%{opacity:0;transform:translateY(8px) scale(.6)}40%{opacity:1}100%{opacity:0;transform:translateY(-20px) scale(1)}}
@keyframes ew-twinkle{0%,100%{opacity:.15;transform:scale(.4) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(45deg)}}
@keyframes ew-shadow{0%,100%{transform:translateX(-6px) scaleX(.9)}50%{transform:translateX(6px) scaleX(.9)}25%,75%{transform:translateX(0) scaleX(1)}}
@media (prefers-reduced-motion: reduce){.ew-root *{animation:none!important}}
`}</style>
      <defs>
        <linearGradient id="ew-heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FEE2E2" />
        </linearGradient>
        <linearGradient id="ew-core" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <filter id="ew-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* backdrop */}
      <circle cx="120" cy="104" r="80" fill="#F3F4F6" />
      <circle cx="66" cy="62" r="24" fill="#FEF2F2" />
      <circle cx="184" cy="146" r="20" fill="#FEF2F2" />

      {/* clothing rail */}
      <path d="M56 26 H184" stroke="#D1D5DB" strokeWidth="6" strokeLinecap="round" />
      <circle cx="56" cy="26" r="5" fill="#9CA3AF" />
      <circle cx="184" cy="26" r="5" fill="#9CA3AF" />

      {/* shadow */}
      <ellipse className="ew-a ew-shadow" cx="120" cy="174" rx="38" ry="5" fill="#D1D5DB" opacity=".6" filter="url(#ew-blur)" />

      {/* swaying hanger with heart */}
      <g className="ew-sway">
        <path
          d="M120 50 V44 C120 38 127 37 127 30 C127 23 117 22 115 28"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M120 50 L74 80 Q68 85 76 85 H164 Q172 85 166 80 Z"
          fill="#FEF2F2"
          stroke="#EF4444"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="120" cy="50" r="3.2" fill="#DC2626" />
        <path d="M106 86 L108 102 M134 86 L132 102" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
        <path d={HEART} fill="url(#ew-heart)" />
        <path className="ew-march" d={HEART} pathLength="70" fill="none" stroke="#F87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <g transform="translate(120 124) scale(.42) translate(-120 -124)">
          <path className="ew-a ew-beat" d={HEART} fill="url(#ew-core)" />
        </g>
        <path d="M100 110 Q102 104 108 104" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* rising mini hearts */}
      {[
        [66, 128, "#FECACA", "0s"],
        [178, 110, "#F87171", "-1.4s"],
        [190, 150, "#FECACA", "-2.8s"],
        [52, 100, "#EF4444", "-2s"],
      ].map(([x, y, c, d]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path className="ew-a ew-rise" d={MINI_HEART} fill={c} style={{ animationDelay: d }} />
        </g>
      ))}

      {/* sparkles */}
      {[
        [72, 58, "#F87171", "0s"],
        [172, 60, "#FECACA", "-1s"],
        [152, 168, "#D1D5DB", "-1.9s"],
        [40, 150, "#F87171", "-0.5s"],
      ].map(([x, y, c, d]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path className="ew-a ew-spark" d={SPARK} fill={c} style={{ animationDelay: d }} />
        </g>
      ))}
    </svg>
  );
}

export default EmptyWishlist;
