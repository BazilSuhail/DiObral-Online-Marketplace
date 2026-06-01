const spark = (x, y, r) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

export function SignInRequired({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="Sign in required"
      className={`si-root ${className}`}
    >
      <style>{`
        .si-root .si-a{transform-box:fill-box;transform-origin:center}
        .si-float{animation:si-float 4s ease-in-out infinite}
        .si-bag{animation:si-bag 5s ease-in-out infinite}
        .si-shackle{animation:si-shackle 2.4s ease-in-out infinite}
        .si-key{animation:si-key 3s ease-in-out infinite}
        .si-twinkle{animation:si-twinkle 2.4s ease-in-out infinite}
        .si-dash{stroke-dasharray:4 5;animation:si-dash 2.4s linear infinite}
        @keyframes si-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes si-bag{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}
        @keyframes si-shackle{0%,60%,100%{transform:translateY(0)}75%{transform:translateY(-4px)}}
        @keyframes si-key{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(-7px,3px) rotate(-10deg)}}
        @keyframes si-twinkle{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
        @keyframes si-dash{to{stroke-dashoffset:18}}
        @media (prefers-reduced-motion: reduce){.si-root *{animation:none!important}}
      `}</style>
      <defs>
        <filter id="si-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="si-bag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* backdrop */}
      <path d="M28 114C24 66 72 28 126 32c56 4 90 40 84 88-4 42-46 60-94 58-50-2-84-20-88-64Z" fill="#F3F4F6" />
      <circle cx="196" cy="56" r="24" fill="#FEF2F2" />

      {/* ground */}
      <ellipse cx="120" cy="172" rx="54" ry="6" fill="#1F2937" opacity=".14" filter="url(#si-blur)" />

      {/* shopping bag with padlock */}
      <g className="si-a si-bag">
        <path d="M82 80h76l8 84a6 6 0 0 1-6 6H80a6 6 0 0 1-6-6Z" fill="url(#si-bag)" />
        <path d="M150 80h8l8 84a6 6 0 0 1-6 6h-6Z" fill="#B91C1C" opacity=".35" />
        <path d="M82 80h76l1 10H81Z" fill="#B91C1C" opacity=".45" />
        <path d="M100 90V74a20 20 0 0 1 40 0v16" stroke="#B91C1C" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M86 100l-2 30" stroke="#FECACA" strokeWidth="3" strokeLinecap="round" opacity=".7" />

        <path className="si-a si-shackle" d="M110 118v-8a10 10 0 0 1 20 0v8" stroke="#D1D5DB" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="102" y="116" width="36" height="30" rx="6" fill="#FFFFFF" />
        <rect x="102" y="140" width="36" height="6" rx="3" fill="#E5E7EB" />
        <circle cx="120" cy="127" r="4" fill="#1F2937" />
        <rect x="118.5" y="128" width="3" height="8" rx="1.5" fill="#1F2937" />
      </g>

      {/* dashed path key -> lock */}
      <path className="si-dash" d="M172 112Q158 120 144 128" stroke="#F87171" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* key */}
      <g className="si-a si-key">
        <path d="M197 104h-24" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" />
        <path d="M178 104v7M185 104v5" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
        <circle cx="206" cy="104" r="10" fill="#FFFFFF" stroke="#DC2626" strokeWidth="5" />
        <circle cx="206" cy="104" r="3" fill="#FECACA" />
      </g>

      {/* avatar badge */}
      <g className="si-a si-float">
        <ellipse cx="52" cy="98" rx="14" ry="3" fill="#1F2937" opacity=".08" />
        <circle cx="52" cy="62" r="21" fill="#FFFFFF" stroke="#FECACA" strokeWidth="2" />
        <clipPath id="si-avatar-clip">
          <circle cx="52" cy="62" r="19" />
        </clipPath>
        <g clipPath="url(#si-avatar-clip)">
          <circle cx="52" cy="56" r="7" fill="#D1D5DB" />
          <path d="M36 82a16 14 0 0 1 32 0Z" fill="#D1D5DB" />
        </g>
        <circle cx="68" cy="46" r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M68 43v3.5M68 49v.1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* sparkles */}
      <path className="si-a si-twinkle" d={spark(176, 36, 5)} fill="#F87171" />
      <path className="si-a si-twinkle" style={{ animationDelay: "-.8s" }} d={spark(34, 132, 4)} fill="#9CA3AF" />
      <path className="si-a si-twinkle" style={{ animationDelay: "-1.6s" }} d={spark(212, 146, 3.5)} fill="#F87171" />
    </svg>
  );
}

export default SignInRequired;
