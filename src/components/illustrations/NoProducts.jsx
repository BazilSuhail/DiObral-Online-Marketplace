const SPARK = "M0 -6 Q1 -1 6 0 Q1 1 0 6 Q-1 1 -6 0 Q-1 -1 0 -6Z";

export function NoProducts({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="No products match your search"
      className={`np-root ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
.np-root .np-a{transform-box:fill-box;transform-origin:center}
.np-root .np-scan{animation:np-scan 5.5s ease-in-out infinite}
.np-root .np-q{animation:np-q 3s ease-in-out infinite}
.np-root .np-glint{animation:np-glint 5.5s ease-in-out infinite}
.np-root .np-march{stroke-dasharray:5 6;animation:np-march 3s linear infinite}
.np-root .np-wiggle{animation:np-wiggle 4s ease-in-out infinite}
.np-root .np-spark{animation:np-twinkle 2.4s ease-in-out infinite}
@keyframes np-scan{0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(-18px,6px) rotate(-6deg)}50%{transform:translate(-8px,14px) rotate(-2deg)}75%{transform:translate(6px,4px) rotate(4deg)}}
@keyframes np-q{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-7px) rotate(6deg)}}
@keyframes np-glint{0%,60%,100%{opacity:.35}70%{opacity:1}}
@keyframes np-march{to{stroke-dashoffset:-44}}
@keyframes np-wiggle{0%,100%{transform:translateX(0)}50%{transform:translateX(2px)}}
@keyframes np-twinkle{0%,100%{opacity:.15;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion: reduce){.np-root *{animation:none!important}}
`}</style>
      <defs>
        <linearGradient id="np-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#EF4444" />
        </linearGradient>
        <radialGradient id="np-lens" cx=".35" cy=".35" r=".8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FEF2F2" />
        </radialGradient>
        <filter id="np-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="np-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* backdrop */}
      <circle cx="120" cy="100" r="82" fill="#F3F4F6" />
      <circle cx="62" cy="58" r="26" fill="#FEF2F2" />
      <circle cx="196" cy="150" r="18" fill="#FEF2F2" />

      {/* search trail */}
      <path className="np-march" d="M146 52 Q178 36 200 62" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />

      {/* stack shadow */}
      <ellipse cx="104" cy="166" rx="54" ry="6" fill="#D1D5DB" opacity=".6" filter="url(#np-blur)" />

      {/* folded t-shirt stack */}
      <rect x="66" y="146" width="76" height="16" rx="5" fill="#E5E7EB" />
      <path d="M70 156 H138" stroke="#D1D5DB" strokeWidth="1.5" />
      <path d="M94 146 Q104 154 114 146" fill="none" stroke="#9CA3AF" strokeWidth="1.8" />

      <rect x="69" y="130" width="72" height="16" rx="5" fill="#FECACA" />
      <path d="M73 140 H137" stroke="#FEE2E2" strokeWidth="1.5" />
      <path d="M95 130 Q105 138 115 130" fill="none" stroke="#F87171" strokeWidth="1.8" />

      <g className="np-a np-wiggle">
        <rect x="66" y="114" width="76" height="16" rx="5" fill="url(#np-top)" />
        <path d="M76 117 V127 M132 117 V127" stroke="#B91C1C" strokeWidth="1.4" strokeLinecap="round" opacity=".45" />
        <path d="M94 114 Q104 124 114 114" fill="#DC2626" stroke="#B91C1C" strokeWidth="1.8" />
        <path d="M70 118 Q72 116 76 116" fill="none" stroke="#FEE2E2" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* question bubble */}
      <g className="np-a np-q">
        <circle cx="104" cy="82" r="17" fill="#D1D5DB" opacity=".5" filter="url(#np-soft)" transform="translate(0 3)" />
        <circle cx="104" cy="82" r="17" fill="#FFFFFF" />
        <path d="M97 77 C97 69 111 69 111 77 C111 83 104 83 104 89" fill="none" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="104" cy="96" r="2.6" fill="#EF4444" />
      </g>

      {/* magnifier */}
      <g className="np-a np-scan">
        <g transform="translate(168 100)">
          <path d="M14 14 L30 30" stroke="#B91C1C" strokeWidth="10" strokeLinecap="round" />
          <path d="M16 16 L30 30" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />
          <circle r="20" fill="url(#np-lens)" opacity=".85" />
          <circle r="20" fill="none" stroke="#9CA3AF" strokeWidth="6" />
          <circle r="20" fill="none" stroke="#D1D5DB" strokeWidth="2" />
          <path className="np-glint" d="M-11 -5 A12 12 0 0 1 -4 -12" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <path d="M-6 0 H6" stroke="#FECACA" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>

      {/* sparkles */}
      {[
        [48, 112, "#F87171", "0s"],
        [204, 96, "#FECACA", "-0.8s"],
        [138, 34, "#F87171", "-1.5s"],
        [40, 160, "#D1D5DB", "-2s"],
      ].map(([x, y, c, d]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path className="np-a np-spark" d={SPARK} fill={c} style={{ animationDelay: d }} />
        </g>
      ))}
    </svg>
  );
}

export default NoProducts;
