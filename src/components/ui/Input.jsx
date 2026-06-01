// `variant="soft"` opts into the Soft UI input (see UI_SOFT_GUIDE.md).
export default function Input ({ className = "", variant, ...props }) {
    if (variant === "soft") {
        return <input className={`soft-input ${className}`} {...props} />
    }
    return (
        <input
            className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    )
}
