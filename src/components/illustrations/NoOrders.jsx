const SPARK = "M0 -6 Q1 -1 6 0 Q1 1 0 6 Q-1 1 -6 0 Q-1 -1 0 -6Z";

export function NoOrders({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="No orders yet"
      className={`no-root ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
.no-root .no-a{transform-box:fill-box;transform-origin:center}
.no-root .no-truck{animation:no-bump 2s ease-in-out infinite}
.no-root .no-wheel{animation:no-spin 1.2s linear infinite}
.no-root .no-road{stroke-dasharray:10 8;animation:no-road 2s linear infinite}
.no-root .no-flapL{transform-box:fill-box;transform-origin:100% 100%;animation:no-flapL 3.6s ease-in-out infinite}
.no-root .no-flapR{transform-box:fill-box;transform-origin:0% 100%;animation:no-flapR 3.6s ease-in-out infinite}
.no-root .no-draw{stroke-dasharray:100;animation:no-draw 4s ease-in-out infinite}
.no-root .no-tilt{animation:no-tilt 5s ease-in-out infinite}
.no-root .no-curl{stroke-dasharray:100;animation:no-curl 4.5s ease-in-out infinite}
.no-root .no-spark{animation:no-twinkle 2.6s ease-in-out infinite}
@keyframes no-bump{0%,100%{transform:translateY(0)}25%{transform:translateY(-1.5px)}50%{transform:translateY(0)}75%{transform:translateY(-1px)}}
@keyframes no-spin{to{transform:rotate(360deg)}}
@keyframes no-road{to{stroke-dashoffset:36}}
@keyframes no-flapL{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-7deg)}}
@keyframes no-flapR{0%,100%{transform:rotate(0deg)}50%{transform:rotate(7deg)}}
@keyframes no-draw{0%{stroke-dashoffset:100}45%,80%{stroke-dashoffset:0}100%{stroke-dashoffset:-100}}
@keyframes no-tilt{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-5px) rotate(-3deg)}}
@keyframes no-curl{0%{stroke-dashoffset:100;opacity:0}20%{opacity:1}60%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
@keyframes no-twinkle{0%,100%{opacity:.15;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion: reduce){.no-root *{animation:none!important}}
`}</style>
      <defs>
        <linearGradient id="no-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FEE2E2" />
          <stop offset="1" stopColor="#FECACA" />
        </linearGradient>
        <linearGradient id="no-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B91C1C" />
          <stop offset="1" stopColor="#F87171" />
        </linearGradient>
        <filter id="no-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* backdrop */}
      <circle cx="120" cy="100" r="82" fill="#F3F4F6" />
      <circle cx="182" cy="56" r="28" fill="#FEF2F2" />
      <circle cx="40" cy="70" r="18" fill="#FEF2F2" />

      {/* road */}
      <path className="no-road" d="M12 170 H228" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />

      {/* shadows */}
      <ellipse cx="124" cy="163" rx="40" ry="5" fill="#D1D5DB" opacity=".6" filter="url(#no-blur)" />
      <ellipse cx="50" cy="166" rx="30" ry="4" fill="#D1D5DB" opacity=".6" filter="url(#no-blur)" />

      {/* curl rising from empty box */}
      <path
        className="no-curl"
        d="M120 90 C110 78 130 70 120 58 C113 50 122 42 128 40"
        pathLength="100"
        fill="none"
        stroke="#D1D5DB"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* open empty box */}
      <path d="M94 96 L100 74 H140 L146 96 Z" fill="#FEE2E2" stroke="#FECACA" strokeWidth="2" strokeLinejoin="round" />
      <path d="M88 104 L94 96 H146 L152 104 Z" fill="url(#no-inner)" />
      <path className="no-flapL" d="M88 104 L66 90 L76 82 L94 96 Z" fill="#FECACA" stroke="#F87171" strokeWidth="1.5" strokeLinejoin="round" />
      <path className="no-flapR" d="M152 104 L174 90 L164 82 L146 96 Z" fill="#FECACA" stroke="#F87171" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="88" y="104" width="64" height="56" rx="4" fill="url(#no-box)" />
      <path d="M88 108 H152" stroke="#FECACA" strokeWidth="3" />
      <rect x="114" y="104" width="12" height="20" fill="#FEF2F2" opacity=".9" />
      <rect x="96" y="132" width="28" height="18" rx="2.5" fill="#FFFFFF" />
      <path d="M100 138 H118 M100 144 H112" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
      <path d="M138 136 V146 M134 140 L138 136 L142 140" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* clipboard */}
      <g className="no-a no-tilt">
        <g transform="rotate(8 192 98)">
          <rect x="172" y="70" width="40" height="56" rx="5" fill="#D1D5DB" />
          <rect x="176" y="76" width="32" height="46" rx="3" fill="#FFFFFF" />
          <rect x="184" y="66" width="16" height="8" rx="3" fill="#EF4444" />
          {[88, 100, 112].map((y, i) => (
            <g key={y}>
              <rect x="180" y={y - 3} width="6" height="6" rx="1.5" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
              <path
                className="no-draw"
                d={`M190 ${y} H204`}
                pathLength="100"
                stroke="#E5E7EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ animationDelay: `${-i * 0.5}s` }}
              />
            </g>
          ))}
        </g>
      </g>

      {/* delivery truck */}
      <g stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round">
        <path className="no-road" d="M4 142 H16" />
        <path className="no-road" d="M2 152 H14" style={{ animationDelay: "-0.6s" }} />
      </g>
      <g className="no-a no-truck">
        <rect x="22" y="134" width="36" height="24" rx="3" fill="#EF4444" />
        <rect x="26" y="140" width="28" height="3" rx="1.5" fill="#FEE2E2" />
        <path d="M58 140 H70 Q74 140 76 144 L80 152 V156 Q80 158 78 158 H58 Z" fill="#DC2626" />
        <path d="M61 143 H69 Q71 143 72 145 L75 150 H61 Z" fill="#FEF2F2" />
        <rect x="76" y="153" width="5" height="3" rx="1" fill="#FECACA" />
        {[32, 68].map((x) => (
          <g key={x} transform={`translate(${x} 160)`}>
            <g className="no-a no-wheel">
              <circle r="6" fill="#1F2937" />
              <circle r="2.6" fill="#D1D5DB" />
              <path d="M0 -5 V-3" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          </g>
        ))}
      </g>

      {/* sparkles */}
      {[
        [150, 40, "#F87171", "0s"],
        [86, 50, "#FECACA", "-1.1s"],
        [214, 150, "#D1D5DB", "-1.8s"],
      ].map(([x, y, c, d]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path className="no-a no-spark" d={SPARK} fill={c} style={{ animationDelay: d }} />
        </g>
      ))}
    </svg>
  );
}

export default NoOrders;
