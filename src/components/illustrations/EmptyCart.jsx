const SPARK = "M0 -6 Q1 -1 6 0 Q1 1 0 6 Q-1 1 -6 0 Q-1 -1 0 -6Z";
const BASKET = "M72 76 H184 Q189 76 188 81 L179 117 Q178 122 173 122 H84 Z";

export function EmptyCart({ className = "", size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 200"
      width={size}
      height={(size * 200) / 240}
      role="img"
      aria-label="Your shopping cart is empty"
      className={`ec-root ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
.ec-root .ec-a{transform-box:fill-box;transform-origin:center}
.ec-root .ec-float1{animation:ec-float 4s ease-in-out infinite}
.ec-root .ec-float2{animation:ec-float 5s ease-in-out -1.6s infinite}
.ec-root .ec-float3{animation:ec-float 4.6s ease-in-out -3s infinite}
.ec-root .ec-cart{animation:ec-bob 3s ease-in-out infinite}
.ec-root .ec-wheel{animation:ec-spin 2.4s linear infinite}
.ec-root .ec-spark{animation:ec-twinkle 2.6s ease-in-out infinite}
.ec-root .ec-dash{stroke-dasharray:14 30;animation:ec-dash 2.2s ease-in-out infinite}
.ec-root .ec-shadow{animation:ec-shadow 3s ease-in-out infinite}
@keyframes ec-float{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-8px) rotate(5deg)}}
@keyframes ec-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes ec-spin{to{transform:rotate(360deg)}}
@keyframes ec-twinkle{0%,100%{opacity:.15;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
@keyframes ec-dash{0%{stroke-dashoffset:44}100%{stroke-dashoffset:0}}
@keyframes ec-shadow{0%,100%{transform:scaleX(1);opacity:.55}50%{transform:scaleX(.92);opacity:.4}}
@media (prefers-reduced-motion: reduce){.ec-root *{animation:none!important}}
`}</style>
      <defs>
        <linearGradient id="ec-basket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F3F4F6" />
        </linearGradient>
        <linearGradient id="ec-shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F87171" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <clipPath id="ec-clip">
          <path d={BASKET} />
        </clipPath>
        <filter id="ec-blur" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* backdrop */}
      <circle cx="124" cy="98" r="82" fill="#F3F4F6" />
      <circle cx="170" cy="58" r="30" fill="#FEF2F2" />
      <circle cx="56" cy="142" r="16" fill="#FEF2F2" />

      {/* motion lines */}
      <g stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round">
        <path className="ec-dash" d="M22 96 H48" />
        <path className="ec-dash" d="M14 108 H44" style={{ animationDelay: "-0.7s" }} />
        <path className="ec-dash" d="M24 120 H48" style={{ animationDelay: "-1.4s" }} />
      </g>

      {/* ground shadow */}
      <ellipse className="ec-a ec-shadow" cx="128" cy="162" rx="66" ry="6" fill="#D1D5DB" filter="url(#ec-blur)" />

      {/* cart */}
      <g className="ec-a ec-cart">
        <path d="M84 122 L88 138 H170" fill="none" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={BASKET} fill="url(#ec-basket)" />
        <g clipPath="url(#ec-clip)" stroke="#E5E7EB" strokeWidth="2">
          <path d="M100 76 V122 M120 76 V122 M140 76 V122 M160 76 V122" />
          <path d="M70 92 H190 M70 107 H190" />
        </g>
        <path d={BASKET} fill="none" stroke="#D1D5DB" strokeWidth="3" strokeLinejoin="round" />
        <path d="M74 76 H184" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
        <path d="M54 62 H64 Q68 62 69 66 L84 122" fill="none" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M44 62 H56" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
        {[96, 162].map((x) => (
          <g key={x} transform={`translate(${x} 148)`}>
            <g className="ec-a ec-wheel">
              <circle r="9" fill="#9CA3AF" />
              <circle r="6" fill="#F3F4F6" />
              <path d="M-6 0 H6 M0 -6 V6" stroke="#D1D5DB" strokeWidth="1.6" />
              <circle r="2.4" fill="#1F2937" />
            </g>
          </g>
        ))}
      </g>

      {/* floating t-shirt */}
      <g className="ec-a ec-float1">
        <g transform="translate(118 40) rotate(-8)">
          <path
            d="M-14 -12 L-6 -16 Q0 -10 6 -16 L14 -12 L21 -3 L13 1 L12 16 Q12 18 10 18 H-10 Q-12 18 -12 16 L-13 1 L-21 -3 Z"
            fill="url(#ec-shirt)"
            stroke="#B91C1C"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M-6 -16 Q0 -8 6 -16" fill="none" stroke="#FEE2E2" strokeWidth="2" strokeLinecap="round" />
          <path d="M-13 1 L-12 -6 M13 1 L12 -6" stroke="#B91C1C" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
        </g>
      </g>

      {/* floating sock */}
      <g className="ec-a ec-float2">
        <g transform="translate(164 34) rotate(14)">
          <path
            d="M-5 -14 H5 V2 Q5 6 9 8 L13 10 Q17 13 14 17 Q12 19 8 18 L-1 14 Q-5 12 -5 6 Z"
            fill="#FFFFFF"
            stroke="#D1D5DB"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="-5" y="-14" width="10" height="5" rx="1.5" fill="#EF4444" />
          <path d="M-5 -3 H5" stroke="#FECACA" strokeWidth="2" />
        </g>
      </g>

      {/* floating price tag */}
      <g className="ec-a ec-float3">
        <g transform="translate(76 38) rotate(-14)">
          <path d="M-10 -6 H6 L12 0 L6 6 H-10 Q-12 6 -12 4 V-4 Q-12 -6 -10 -6Z" fill="#FEE2E2" stroke="#F87171" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="5" cy="0" r="1.6" fill="#FFFFFF" stroke="#F87171" strokeWidth="1" />
          <path d="M-8 -1.5 H0 M-8 1.5 H-3" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>

      {/* sparkles */}
      {[
        [140, 22, "#F87171", "0s"],
        [200, 92, "#FECACA", "-0.9s"],
        [42, 74, "#F87171", "-1.7s"],
        [196, 140, "#D1D5DB", "-2.2s"],
      ].map(([x, y, c, d]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path className="ec-a ec-spark" d={SPARK} fill={c} style={{ animationDelay: d }} />
        </g>
      ))}
    </svg>
  );
}

export default EmptyCart;
