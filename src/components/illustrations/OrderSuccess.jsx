const CONFETTI = [
  { x: 60, y: 20, w: 5, h: 8, c: "#EF4444", d: 0.9, t: 3.4 },
  { x: 78, y: 10, w: 4, h: 4, c: "#FECACA", d: 1.6, t: 3.9, r: true },
  { x: 96, y: 24, w: 4, h: 7, c: "#9CA3AF", d: 1.1, t: 4.2 },
  { x: 182, y: 16, w: 5, h: 8, c: "#F87171", d: 1.3, t: 3.6 },
  { x: 200, y: 30, w: 4, h: 4, c: "#DC2626", d: 2.1, t: 4.4, r: true },
  { x: 168, y: 34, w: 4, h: 6, c: "#D1D5DB", d: 2.6, t: 3.2 },
  { x: 44, y: 44, w: 4, h: 4, c: "#F87171", d: 1.9, t: 4.6, r: true },
  { x: 214, y: 52, w: 5, h: 7, c: "#FECACA", d: 0.8, t: 3.8 },
  { x: 120, y: 8, w: 4, h: 7, c: "#EF4444", d: 2.4, t: 4 },
];

export function OrderSuccess({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="Order placed successfully"
      className={`os-root ${className}`}
    >
      <style>{`
        .os-root .os-a{transform-box:fill-box;transform-origin:center}
        .os-float{animation:os-float 4s ease-in-out infinite}
        .os-pop{transform:scale(0);animation:os-pop .55s cubic-bezier(.34,1.56,.64,1) .2s forwards}
        .os-check{stroke-dasharray:32;stroke-dashoffset:32;animation:os-draw .7s ease-out .65s forwards}
        .os-ring{animation:os-ring 2.4s ease-out 1.3s infinite;opacity:0}
        .os-confetti{opacity:0;animation-name:os-fall;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
        .os-truck{animation:os-drive 6s ease-in-out infinite}
        .os-wheel{animation:os-spin .5s linear infinite}
        .os-lane{stroke-dasharray:10 8;animation:os-lane .8s linear infinite}
        @keyframes os-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes os-pop{to{transform:scale(1)}}
        @keyframes os-draw{to{stroke-dashoffset:0}}
        @keyframes os-ring{0%{opacity:.6;transform:scale(1)}100%{opacity:0;transform:scale(1.6)}}
        @keyframes os-fall{0%{opacity:0;transform:translateY(-8px) rotate(0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateY(70px) rotate(300deg)}}
        @keyframes os-drive{0%{transform:translateX(-70px)}100%{transform:translateX(250px)}}
        @keyframes os-spin{to{transform:rotate(360deg)}}
        @keyframes os-lane{to{stroke-dashoffset:18}}
        @media (prefers-reduced-motion: reduce){
          .os-root *{animation:none!important}
          .os-root .os-check{stroke-dashoffset:0}
          .os-root .os-pop{transform:none}
          .os-root .os-truck{transform:translateX(90px)}
        }
      `}</style>
      <defs>
        <filter id="os-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="os-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <clipPath id="os-road-clip">
          <rect x="16" y="100" width="208" height="70" rx="10" />
        </clipPath>
      </defs>

      {/* backdrop */}
      <path d="M30 112C24 64 72 26 126 30c56 4 88 38 84 84-4 40-44 58-92 56-50-2-82-18-88-58Z" fill="#F3F4F6" />
      <circle cx="70" cy="60" r="22" fill="#FEF2F2" />

      {/* confetti */}
      {CONFETTI.map((p, i) =>
        p.r ? (
          <circle key={i} className="os-a os-confetti" cx={p.x} cy={p.y} r={p.w / 2} fill={p.c} style={{ animationDuration: `${p.t}s`, animationDelay: `${p.d}s` }} />
        ) : (
          <rect key={i} className="os-a os-confetti" x={p.x} y={p.y} width={p.w} height={p.h} rx="1" fill={p.c} style={{ animationDuration: `${p.t}s`, animationDelay: `${p.d}s` }} />
        ),
      )}

      {/* package */}
      <ellipse cx="122" cy="126" rx="40" ry="5" fill="#1F2937" opacity=".12" filter="url(#os-blur)" />
      <g className="os-a os-float">
        <path d="M86 72l18-12h54l-18 12Z" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M140 72l18-12v48l-18 14Z" fill="#FECACA" />
        <rect x="86" y="72" width="54" height="50" rx="2" fill="#FEE2E2" />
        <path d="M107 72l18-12h10l-18 12Z" fill="#F87171" />
        <rect x="107" y="72" width="10" height="50" fill="#F87171" opacity=".85" />
        <rect x="92" y="104" width="12" height="10" rx="1.5" fill="#FFFFFF" />
        <path d="M94 108h8M94 111h5" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M124 110l4 4 4-4" stroke="#F87171" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* success badge */}
      <circle className="os-a os-ring" cx="160" cy="58" r="21" fill="none" stroke="#F87171" strokeWidth="2" />
      <g className="os-a os-pop">
        <circle cx="160" cy="58" r="21" fill="url(#os-badge)" stroke="#FFFFFF" strokeWidth="3" />
        <path className="os-check" d="M150 58l7 7 13-14" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* road */}
      <rect x="16" y="146" width="208" height="22" rx="11" fill="#E5E7EB" />
      <path className="os-lane" d="M28 157h184" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

      {/* delivery truck */}
      <g clipPath="url(#os-road-clip)">
        <g className="os-truck">
          <ellipse cx="26" cy="160" rx="26" ry="3" fill="#1F2937" opacity=".12" />
          <path d="M-14 136h-8M-10 144h-10" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
          <rect x="0" y="128" width="34" height="26" rx="3" fill="#EF4444" />
          <rect x="0" y="148" width="34" height="6" rx="3" fill="#B91C1C" />
          <path d="M7 138l4 4 7-7" stroke="#FFFFFF" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M34 134h9l8 9v11H34Z" fill="#DC2626" />
          <path d="M37 137h5l5 6H37Z" fill="#FEF2F2" />
          <rect x="47" y="148" width="4" height="3" rx="1" fill="#FEE2E2" />
          {[10, 41].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="155" r="5.5" fill="#1F2937" />
              <g className="os-a os-wheel">
                <circle cx={cx} cy="155" r="2.6" fill="#D1D5DB" />
                <path d={`M${cx - 2.6} 155h5.2`} stroke="#1F2937" strokeWidth="1" />
              </g>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

export default OrderSuccess;
