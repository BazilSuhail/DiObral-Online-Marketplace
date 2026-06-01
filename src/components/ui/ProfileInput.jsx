// `soft` opts into the Soft UI input; `icon` (a react-icons component) renders inside the field.
export default function ProfileInput ({ label, error, className = "", soft = false, icon: Icon, ...props }) {
  if (soft) {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}
        <div className="relative">
          {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
          <input
            className={`soft-input h-12 ${Icon ? "pl-11" : ""} ${error ? "soft-input-error" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`flex h-12 w-full rounded-lg border-2 ${error ? "border-red-300 focus:border-red-500" : props.disabled ? "border-gray-100" : "border-gray-300 focus:border-red-500"
          } ${props.disabled ? "bg-gray-100 text-gray-700" : "bg-white"} px-4 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-0 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
