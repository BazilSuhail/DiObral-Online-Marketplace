const spark = (x, y, r) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

export function NotFound({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="Page not found"
      className={`nfd-root ${className}`}
    >
      <style>{`
        .nfd-root .nfd-a{transform-box:fill-box;transform-origin:center}
        .nfd-swing{animation:nfd-swing 3.4s ease-in-out infinite;transform-origin:top center!important}
        .nfd-board{animation:nfd-board 4s ease-in-out infinite;transform-origin:4px 4px!important}
        .nfd-needle{animation:nfd-needle 4.5s ease-in-out infinite}
        .nfd-float{animation:nfd-float 3.6s ease-in-out infinite}
        .nfd-twinkle{animation:nfd-twinkle 2.4s ease-in-out infinite}
        .nfd-dash{stroke-dasharray:5 6;animation:nfd-dash 3s linear infinite}
        @keyframes nfd-swing{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
        @keyframes nfd-board{0%,100%{transform:rotate(0)}50%{transform:rotate(6deg)}}
        @keyframes nfd-needle{0%,100%{transform:rotate(0)}25%{transform:rotate(55deg)}50%{transform:rotate(-35deg)}75%{transform:rotate(20deg)}}
        @keyframes nfd-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes nfd-twinkle{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
        @keyframes nfd-dash{to{stroke-dashoffset:-22}}
        @media (prefers-reduced-motion: reduce){.nfd-root *{animation:none!important}}
      `}</style>
      <defs>
        <filter id="nfd-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="nfd-sign" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EF4444" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* backdrop */}
      <path d="M32 116C26 66 74 30 128 34c56 4 86 40 82 86-4 42-44 62-94 60-48-2-78-22-84-64Z" fill="#F3F4F6" />
      <circle cx="58" cy="44" r="18" fill="#FEF2F2" />

      {/* wandering trail */}
      <path className="nfd-dash" d="M24 170C54 150 96 176 130 160S180 150 214 170" stroke="#D1D5DB" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* signpost */}
      <ellipse cx="70" cy="172" rx="30" ry="5" fill="#1F2937" opacity=".12" filter="url(#nfd-blur)" />
      <path d="M52 172q18-12 36 0Z" fill="#E5E7EB" />
      <rect x="66" y="52" width="8" height="120" rx="3" fill="#D1D5DB" />
      <rect x="66" y="52" width="3" height="120" rx="1.5" fill="#E5E7EB" />
      <path d="M38 60h72l11 11-11 11H38a4 4 0 0 1-4-4V64a4 4 0 0 1 4-4Z" fill="url(#nfd-sign)" />
      <path d="M38 78h83l-4 4H38a4 4 0 0 1-4-4Z" fill="#B91C1C" opacity=".5" />
      <text x="76" y="76" textAnchor="middle" fontFamily="Poppins, ui-sans-serif, system-ui, sans-serif" fontWeight="600" fontSize="14" fill="#FFFFFF" letterSpacing="1">404</text>

      {/* broken sign hanging by one nail */}
      <g transform="rotate(28 74 98)">
        <g className="nfd-a nfd-board">
          <path d="M72 94h38l-4 5 5 4-3 4H72a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" strokeLinejoin="round" />
          <path d="M78 101h20" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <circle cx="74" cy="98" r="2.2" fill="#1F2937" />

      {/* lost hanger with tee */}
      <g className="nfd-a nfd-swing">
        <path d="M170 52c0-6 8-6 8 0 0 4-4 5-8 8v4" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M156 86l14-6q6 6 12 0l14 6 8 12-9 6-5-5v30h-28v-30l-5 5-9-6Z" fill="#FEE2E2" stroke="#F87171" strokeWidth="2" strokeLinejoin="round" />
        <path d="M164 82q6 8 12 0" stroke="#F87171" strokeWidth="2" fill="none" />
        <path d="M168 104h16M168 112h10" stroke="#FECACA" strokeWidth="3" strokeLinecap="round" />
        <path d="M170 64l-26 16h52Z" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeLinejoin="round" />
      </g>

      {/* compass */}
      <g className="nfd-a nfd-float">
        <ellipse cx="206" cy="172" rx="14" ry="3" fill="#1F2937" opacity=".1" />
        <circle cx="206" cy="146" r="17" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="3" />
        <circle cx="206" cy="146" r="12" fill="#FEF2F2" />
        <rect x="203" y="125" width="6" height="5" rx="2" fill="#9CA3AF" />
        <g className="nfd-a nfd-needle">
          <path d="M206 135l4 11h-8Z" fill="#EF4444" />
          <path d="M206 157l4-11h-8Z" fill="#9CA3AF" />
        </g>
        <circle cx="206" cy="146" r="1.8" fill="#1F2937" />
      </g>

      {/* question marks */}
      <g className="nfd-a nfd-float" style={{ animationDelay: "-1.2s" }}>
        <text x="214" y="70" fontFamily="Poppins, ui-sans-serif, system-ui, sans-serif" fontWeight="600" fontSize="22" fill="#F87171">?</text>
      </g>
      <g className="nfd-a nfd-float" style={{ animationDelay: "-2.2s" }}>
        <text x="128" y="44" fontFamily="Poppins, ui-sans-serif, system-ui, sans-serif" fontWeight="600" fontSize="15" fill="#9CA3AF">?</text>
      </g>

      {/* sparkles */}
      <path className="nfd-a nfd-twinkle" d={spark(148, 30, 4.5)} fill="#F87171" />
      <path className="nfd-a nfd-twinkle" style={{ animationDelay: "-1s" }} d={spark(26, 96, 4)} fill="#9CA3AF" />
      <path className="nfd-a nfd-twinkle" style={{ animationDelay: "-1.8s" }} d={spark(118, 120, 3.5)} fill="#F87171" />
    </svg>
  );
}

export default NotFound;
