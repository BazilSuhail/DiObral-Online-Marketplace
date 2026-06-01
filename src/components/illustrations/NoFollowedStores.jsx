const spark = (x, y, r) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

const heart = (x, y, s) =>
  `M${x} ${y + 9 * s}C${x - 12 * s} ${y + 1 * s} ${x - 10 * s} ${y - 8 * s} ${x - 4.5 * s} ${y - 8 * s}C${x - 1.5 * s} ${y - 8 * s} ${x} ${y - 6 * s} ${x} ${y - 4 * s}C${x} ${y - 6 * s} ${x + 1.5 * s} ${y - 8 * s} ${x + 4.5 * s} ${y - 8 * s}C${x + 10 * s} ${y - 8 * s} ${x + 12 * s} ${y + 1 * s} ${x} ${y + 9 * s}Z`;

const STRIPES = Array.from({ length: 6 }, (_, i) => i);

export function NoFollowedStores({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="You are not following any stores yet"
      className={`nfs-root ${className}`}
    >
      <style>{`
        .nfs-root .nfs-a{transform-box:fill-box;transform-origin:center}
        .nfs-float{animation:nfs-float 4s ease-in-out infinite}
        .nfs-pulse{animation:nfs-pulse 2s ease-in-out infinite}
        .nfs-sway{animation:nfs-sway 3.6s ease-in-out infinite;transform-origin:top center!important}
        .nfs-twinkle{animation:nfs-twinkle 2.6s ease-in-out infinite}
        .nfs-rise{animation:nfs-rise 3.2s ease-in-out infinite}
        .nfs-dash{stroke-dasharray:4 5;animation:nfs-dash 3s linear infinite}
        @keyframes nfs-float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-7px) rotate(2deg)}}
        @keyframes nfs-pulse{0%,100%{transform:scale(1)}15%{transform:scale(1.14)}30%{transform:scale(.96)}45%{transform:scale(1.06)}}
        @keyframes nfs-sway{0%,100%{transform:skewX(0) scaleY(1)}50%{transform:skewX(-3deg) scaleY(1.05)}}
        @keyframes nfs-twinkle{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
        @keyframes nfs-rise{0%{opacity:0;transform:translateY(8px) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translateY(-22px) scale(1)}}
        @keyframes nfs-dash{to{stroke-dashoffset:-18}}
        @media (prefers-reduced-motion: reduce){.nfs-root *{animation:none!important}}
      `}</style>
      <defs>
        <filter id="nfs-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="nfs-heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* backdrop */}
      <path d="M30 118C24 70 70 32 124 36c56 4 90 36 86 84-4 44-46 62-92 60-50-2-82-20-88-62Z" fill="#F3F4F6" />
      <circle cx="186" cy="68" r="34" fill="#FEF2F2" />

      {/* ground */}
      <ellipse cx="100" cy="174" rx="66" ry="6" fill="#1F2937" opacity=".12" filter="url(#nfs-blur)" />
      <rect x="28" y="170" width="150" height="3" rx="1.5" fill="#E5E7EB" />

      {/* store */}
      <rect x="44" y="84" width="112" height="88" rx="6" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
      <rect x="45" y="160" width="110" height="11" fill="#E5E7EB" />
      <rect x="50" y="56" width="100" height="20" rx="5" fill="#DC2626" />
      <rect x="50" y="70" width="100" height="6" rx="3" fill="#B91C1C" />
      <rect x="74" y="62" width="52" height="5" rx="2.5" fill="#FFFFFF" opacity=".9" />
      <rect x="56" y="108" width="54" height="44" rx="4" fill="#FEF2F2" stroke="#D1D5DB" strokeWidth="2" />
      <path d="M60 126h46" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
      <path d="M64 120l10-8M68 122l6-5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M72 140v-6h8v6M86 140v-8h6v8" stroke="#F87171" strokeWidth="2" fill="#FEE2E2" strokeLinejoin="round" />
      <rect x="118" y="108" width="28" height="62" rx="3" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
      <circle cx="140" cy="142" r="2.2" fill="#9CA3AF" />

      {/* awning */}
      <g className="nfs-a nfs-sway">
        <rect x="40" y="78" width="120" height="5" rx="2.5" fill="#B91C1C" />
        {STRIPES.map((i) => (
          <g key={i} fill={i % 2 ? "#FEE2E2" : "#EF4444"}>
            <rect x={42 + i * 19.33} y="82" width="19.4" height="10" />
            <circle cx={51.67 + i * 19.33} cy="92" r="9.67" />
          </g>
        ))}
      </g>

      {/* connecting dashed path */}
      <path className="nfs-dash" d="M150 58C158 38 168 40 172 50" stroke="#F87171" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* follow bubble */}
      <g className="nfs-a nfs-float">
        <ellipse cx="190" cy="112" rx="18" ry="3.5" fill="#1F2937" opacity=".08" />
        <circle cx="190" cy="74" r="26" fill="#FFFFFF" stroke="#FECACA" strokeWidth="2" />
        <path className="nfs-a nfs-pulse" d={heart(190, 76, 1.5)} fill="url(#nfs-heart)" />
        <path d="M180 66a5 5 0 0 1 5-3" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" />
        <circle cx="210" cy="56" r="9" fill="#B91C1C" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M210 52v8M206 56h8" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
      </g>

      {/* rising mini hearts */}
      <path className="nfs-a nfs-rise" d={heart(206, 128, 0.55)} fill="#F87171" />
      <path className="nfs-a nfs-rise" style={{ animationDelay: "-1.6s" }} d={heart(170, 134, 0.45)} fill="#FECACA" />

      {/* sparkles */}
      <path className="nfs-a nfs-twinkle" d={spark(224, 32, 5)} fill="#F87171" />
      <path className="nfs-a nfs-twinkle" style={{ animationDelay: "-.9s" }} d={spark(28, 50, 4)} fill="#9CA3AF" />
      <path className="nfs-a nfs-twinkle" style={{ animationDelay: "-1.7s" }} d={spark(158, 26, 3.5)} fill="#F87171" />
    </svg>
  );
}

export default NoFollowedStores;
