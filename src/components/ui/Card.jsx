// `soft` opts into the Soft UI surface (see UI_SOFT_GUIDE.md); `hover` adds lift on hover (soft only).
export default function Card ({ children, className = "", soft = false, hover = false, ...props }) {
  const base = soft
    ? `soft-card ${hover ? "soft-card-hover" : ""}`
    : "bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  )
}
