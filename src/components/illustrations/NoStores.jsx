const spark = (x, y, r) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

const STRIPES = Array.from({ length: 8 }, (_, i) => i);

export function NoStores({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="No stores found"
      className={`ns-root ${className}`}
    >
      <style>{`
        .ns-root .ns-a{transform-box:fill-box;transform-origin:center}
        .ns-float{animation:ns-float 4s ease-in-out infinite}
        .ns-float2{animation:ns-float 5s ease-in-out -1.5s infinite}
        .ns-sway{animation:ns-sway 3.6s ease-in-out infinite;transform-origin:top center!important}
        .ns-swing{animation:ns-swing 3s ease-in-out infinite;transform-origin:top center!important}
        .ns-twinkle{animation:ns-twinkle 2.4s ease-in-out infinite}
        .ns-dash{stroke-dasharray:3 5;animation:ns-dash 2.5s linear infinite}
        @keyframes ns-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes ns-sway{0%,100%{transform:skewX(0) scaleY(1)}50%{transform:skewX(-3deg) scaleY(1.04)}}
        @keyframes ns-swing{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
        @keyframes ns-twinkle{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
        @keyframes ns-dash{to{stroke-dashoffset:-16}}
        @media (prefers-reduced-motion: reduce){.ns-root *{animation:none!important}}
      `}</style>
      <defs>
        <filter id="ns-blur" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="ns-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F3F4F6" />
        </linearGradient>
      </defs>

      {/* backdrop */}
      <path d="M38 122C28 72 80 30 132 34c54 4 82 42 76 88-6 42-48 62-94 60-48-2-68-22-76-60Z" fill="#F3F4F6" />
      <circle cx="194" cy="48" r="20" fill="#FEF2F2" />
      <circle cx="36" cy="64" r="10" fill="#FEF2F2" />

      {/* ground */}
      <ellipse cx="120" cy="174" rx="80" ry="6" fill="#1F2937" opacity=".12" filter="url(#ns-blur)" />
      <rect x="34" y="170" width="172" height="3" rx="1.5" fill="#E5E7EB" />

      {/* building */}
      <rect x="58" y="74" width="124" height="98" rx="6" fill="url(#ns-wall)" stroke="#E5E7EB" strokeWidth="2" />
      <rect x="59" y="160" width="122" height="11" fill="#E5E7EB" />
      <rect x="74" y="60" width="4" height="14" rx="2" fill="#D1D5DB" />
      <rect x="162" y="60" width="4" height="14" rx="2" fill="#D1D5DB" />
      <rect x="64" y="40" width="112" height="22" rx="5" fill="#DC2626" />
      <rect x="64" y="56" width="112" height="6" rx="3" fill="#B91C1C" />
      <rect x="92" y="47" width="56" height="5" rx="2.5" fill="#FFFFFF" opacity=".9" />
      <circle cx="80" cy="49.5" r="3" fill="#FECACA" />
      <circle cx="160" cy="49.5" r="3" fill="#FECACA" />

      {/* window with empty shelves */}
      <rect x="68" y="100" width="66" height="56" rx="4" fill="#FEF2F2" stroke="#D1D5DB" strokeWidth="2" />
      <path d="M72 120h58M72 140h58" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
      <path d="M76 114l12-10M80 118l8-7" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path className="ns-dash" d="M96 133q6-4 12 0" stroke="#F87171" fill="none" strokeWidth="1.5" strokeLinecap="round" />

      {/* door */}
      <rect x="142" y="100" width="30" height="70" rx="3" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
      <circle cx="166" cy="138" r="2.2" fill="#9CA3AF" />
      <g className="ns-a ns-swing">
        <path d="M150 112l7-7 7 7" stroke="#9CA3AF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="146" y="112" width="22" height="12" rx="2.5" fill="#FFFFFF" stroke="#F87171" strokeWidth="1.5" />
        <rect x="150" y="117" width="14" height="2" rx="1" fill="#F87171" />
      </g>

      {/* awning */}
      <g className="ns-a ns-sway">
        <rect x="54" y="68" width="132" height="5" rx="2.5" fill="#B91C1C" />
        {STRIPES.map((i) => (
          <g key={i} fill={i % 2 ? "#FEE2E2" : "#EF4444"}>
            <rect x={56 + i * 16} y="72" width="16" height="12" />
            <circle cx={64 + i * 16} cy="84" r="8" />
          </g>
        ))}
      </g>

      {/* magnifier (search miss) */}
      <g className="ns-a ns-float">
        <ellipse cx="203" cy="132" rx="12" ry="3" fill="#1F2937" opacity=".08" />
        <path d="M209 108l11 11" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
        <circle cx="200" cy="98" r="14" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="4" />
        <path d="M193 92a9 9 0 0 1 8-3" stroke="#FECACA" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M196 101l8-6M196 95l8 6" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* floating price tag */}
      <g className="ns-a ns-float2">
        <path d="M24 106l14-14h14v14l-14 14Z" fill="#FFFFFF" stroke="#F87171" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="46" cy="98" r="2.5" fill="#F87171" />
        <path d="M32 108l6-6" stroke="#FECACA" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* sparkles */}
      <path className="ns-a ns-twinkle" d={spark(186, 28, 5)} fill="#F87171" />
      <path className="ns-a ns-twinkle" style={{ animationDelay: "-.8s" }} d={spark(48, 40, 4)} fill="#F87171" />
      <path className="ns-a ns-twinkle" style={{ animationDelay: "-1.6s" }} d={spark(220, 150, 4)} fill="#9CA3AF" />
    </svg>
  );
}

export default NoStores;
