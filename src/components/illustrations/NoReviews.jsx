const SPARK = "M0 -6 Q1 -1 6 0 Q1 1 0 6 Q-1 1 -6 0 Q-1 -1 0 -6Z";
const STAR = "M0 -8 L2 -2.75 L7.61 -2.47 L3.23 1.05 L4.7 6.47 L0 3.4 L-4.7 6.47 L-3.23 1.05 L-7.61 -2.47 L-2 -2.75 Z";
const BUBBLE =
  "M68 40 H172 Q190 40 190 58 V94 Q190 112 172 112 H104 L80 128 L86 112 H68 Q50 112 50 94 V58 Q50 40 68 40 Z";

export function NoReviews({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="No reviews yet"
      className={`nr-root ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
.nr-root .nr-a{transform-box:fill-box;transform-origin:center}
.nr-root .nr-float{animation:nr-float 5s ease-in-out infinite}
.nr-root .nr-glow{animation:nr-glow 4s ease-in-out infinite}
.nr-root .nr-dot{animation:nr-dot 2s ease-in-out infinite}
.nr-root .nr-typing{animation:nr-typing 3.6s ease-in-out infinite}
.nr-root .nr-star{animation:nr-star 4.4s ease-in-out infinite}
.nr-root .nr-spark{animation:nr-twinkle 2.6s ease-in-out infinite}
.nr-root .nr-shadow{animation:nr-shadow 5s ease-in-out infinite}
@keyframes nr-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes nr-glow{0%,100%{opacity:0;transform:scale(.6)}20%{opacity:1;transform:scale(1.1)}35%{opacity:0;transform:scale(.9)}}
@keyframes nr-dot{0%,60%,100%{opacity:.4;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
@keyframes nr-typing{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-3px) rotate(-3deg)}}
@keyframes nr-star{0%,100%{transform:translateY(0) rotate(-12deg)}50%{transform:translateY(-8px) rotate(12deg)}}
@keyframes nr-twinkle{0%,100%{opacity:.15;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
@keyframes nr-shadow{0%,100%{transform:scaleX(1);opacity:.6}50%{transform:scaleX(.88);opacity:.4}}
@media (prefers-reduced-motion: reduce){.nr-root *{animation:none!important}}
`}</style>
      <defs>
        <linearGradient id="nr-typ" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EF4444" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <filter id="nr-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="nr-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* backdrop */}
      <circle cx="120" cy="100" r="82" fill="#F3F4F6" />
      <circle cx="62" cy="152" r="24" fill="#FEF2F2" />
      <circle cx="190" cy="40" r="20" fill="#FEF2F2" />

      {/* ground shadow */}
      <ellipse className="nr-a nr-shadow" cx="116" cy="170" rx="56" ry="5" fill="#D1D5DB" filter="url(#nr-blur)" />

      {/* main speech bubble with empty stars */}
      <g className="nr-a nr-float">
        <path d={BUBBLE} fill="#D1D5DB" opacity=".55" filter="url(#nr-soft)" transform="translate(0 5)" />
        <path d={BUBBLE} fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" strokeLinejoin="round" />
        {[76, 98, 120, 142, 164].map((x, i) => (
          <g key={x} transform={`translate(${x} 70) scale(1.25)`}>
            <path d={STAR} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.3" strokeLinejoin="round" />
            <path className="nr-a nr-glow" d={STAR} fill="#F87171" style={{ animationDelay: `${i * 0.35}s` }} />
          </g>
        ))}
        <rect x="80" y="88" width="80" height="5" rx="2.5" fill="#F3F4F6" />
        <rect x="96" y="98" width="48" height="5" rx="2.5" fill="#F3F4F6" />
      </g>

      {/* typing bubble */}
      <g className="nr-a nr-typing">
        <path d="M184 148 L196 160 L176 150 Z" fill="#DC2626" />
        <rect x="146" y="124" width="54" height="28" rx="14" fill="url(#nr-typ)" />
        {[161, 173, 185].map((x, i) => (
          <circle key={x} className="nr-a nr-dot" cx={x} cy="138" r="3.5" fill="#FFFFFF" style={{ animationDelay: `${i * 0.25}s` }} />
        ))}
      </g>

      {/* floating star */}
      <g className="nr-a nr-star">
        <g transform="translate(36 50) scale(1.7)">
          <path d={STAR} fill="#F87171" stroke="#DC2626" strokeWidth="1" strokeLinejoin="round" />
          <path d="M-2 -3 L0 -6" stroke="#FEE2E2" strokeWidth="1" strokeLinecap="round" />
        </g>
      </g>

      {/* sparkles */}
      {[
        [208, 72, "#F87171", "0s"],
        [28, 104, "#FECACA", "-0.9s"],
        [122, 22, "#F87171", "-1.6s"],
        [210, 172, "#D1D5DB", "-2.1s"],
      ].map(([x, y, c, d]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path className="nr-a nr-spark" d={SPARK} fill={c} style={{ animationDelay: d }} />
        </g>
      ))}
    </svg>
  );
}

export default NoReviews;
