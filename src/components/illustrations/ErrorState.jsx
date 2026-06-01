const spark = (x, y, r) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

export function ErrorState({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="Something went wrong"
      className={`er-root ${className}`}
    >
      <style>{`
        .er-root .er-a{transform-box:fill-box;transform-origin:center}
        .er-float{animation:er-float 4.2s ease-in-out infinite}
        .er-bob{animation:er-bob 2.6s ease-in-out infinite}
        .er-plug{animation:er-plug 2.8s ease-in-out infinite}
        .er-zap{animation:er-zap 1.4s steps(2,jump-none) infinite}
        .er-wrench{animation:er-wrench 3.2s ease-in-out infinite}
        .er-twinkle{animation:er-twinkle 2.4s ease-in-out infinite}
        .er-dash{stroke-dasharray:3 5;animation:er-dash 2s linear infinite}
        @keyframes er-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes er-bob{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-4px) rotate(6deg)}}
        @keyframes er-plug{0%,100%{transform:translateX(0)}50%{transform:translateX(-5px)}}
        @keyframes er-zap{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.15;transform:scale(.8)}}
        @keyframes er-wrench{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(14deg)}}
        @keyframes er-twinkle{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
        @keyframes er-dash{to{stroke-dashoffset:-16}}
        @media (prefers-reduced-motion: reduce){.er-root *{animation:none!important}}
      `}</style>
      <defs>
        <filter id="er-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="er-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F3F4F6" />
        </linearGradient>
      </defs>

      {/* backdrop */}
      <path d="M30 120C22 70 72 28 126 32c56 4 88 40 84 88-4 42-46 60-94 58-50-2-80-18-86-58Z" fill="#F3F4F6" />
      <circle cx="190" cy="132" r="22" fill="#FEF2F2" />

      {/* ground */}
      <ellipse cx="124" cy="170" rx="82" ry="6" fill="#1F2937" opacity=".1" filter="url(#er-blur)" />

      {/* disconnected cloud */}
      <g className="er-a er-float">
        <path d="M78 98a20 20 0 0 1 2-40 30 30 0 0 1 56-10 24 24 0 0 1 36 22 18 18 0 0 1-4 28Z" fill="#E5E7EB" transform="translate(3 5)" />
        <path d="M78 98a20 20 0 0 1 2-40 30 30 0 0 1 56-10 24 24 0 0 1 36 22 18 18 0 0 1-4 28Z" fill="url(#er-cloud)" stroke="#D1D5DB" strokeWidth="2" strokeLinejoin="round" />
        <path d="M94 50a20 20 0 0 1 18-12" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M104 66l6 6m0-6l-6 6M134 66l6 6m0-6l-6 6" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M112 86q10-7 20 0" stroke="#9CA3AF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="98" cy="80" r="4" fill="#FECACA" />
        <circle cx="146" cy="80" r="4" fill="#FECACA" />
      </g>

      {/* cable from cloud to plug */}
      <path className="er-dash" d="M100 100c0 18-26 14-26 34" stroke="#9CA3AF" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* plug */}
      <g className="er-a er-plug">
        <path d="M74 134v6" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" />
        <rect x="62" y="140" width="24" height="18" rx="4" fill="#EF4444" />
        <rect x="62" y="152" width="24" height="6" rx="3" fill="#B91C1C" />
        <rect x="86" y="143" width="9" height="3.5" rx="1.5" fill="#9CA3AF" />
        <rect x="86" y="151" width="9" height="3.5" rx="1.5" fill="#9CA3AF" />
      </g>

      {/* spark in the gap */}
      <g className="er-a er-zap">
        <path d="M104 138l6 7-5 2 6 8" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M100 160l-3 4M116 136l3-4" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* socket + cable to wall */}
      <path d="M144 149c22 0 18 19 44 19h24" stroke="#9CA3AF" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="120" y="136" width="26" height="26" rx="5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
      <rect x="125" y="141" width="16" height="16" rx="3" fill="#F3F4F6" />
      <rect x="125" y="143" width="5" height="3.5" rx="1.5" fill="#1F2937" />
      <rect x="125" y="151" width="5" height="3.5" rx="1.5" fill="#1F2937" />

      {/* warning badge */}
      <g className="er-a er-bob">
        <path d="M184 24l17 30h-34Z" fill="#EF4444" stroke="#EF4444" strokeWidth="5" strokeLinejoin="round" />
        <path d="M184 34v9" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="184" cy="49" r="2" fill="#FFFFFF" />
      </g>

      {/* wrench */}
      <g transform="rotate(-35 44 156)">
        <g className="er-a er-wrench">
          <rect x="40" y="140" width="8" height="34" rx="4" fill="#9CA3AF" />
          <rect x="42" y="146" width="2.5" height="22" rx="1.2" fill="#D1D5DB" />
          <circle cx="44" cy="136" r="10" fill="#9CA3AF" />
          <rect x="40.5" y="124" width="7" height="12" rx="2" fill="#F3F4F6" />
        </g>
      </g>

      {/* sparkles */}
      <path className="er-a er-twinkle" d={spark(52, 44, 4.5)} fill="#F87171" />
      <path className="er-a er-twinkle" style={{ animationDelay: "-.9s" }} d={spark(214, 88, 4)} fill="#9CA3AF" />
      <path className="er-a er-twinkle" style={{ animationDelay: "-1.6s" }} d={spark(160, 112, 3)} fill="#F87171" />
    </svg>
  );
}

export default ErrorState;
