export default function Badge({ children, variant = "default", className = "" }) {
    const variants = {
        default: "bg-black text-white",
        secondary: "bg-gray-100 text-gray-900",
        destructive: "bg-red-500 text-white",
        pending: "bg-yellow-100 text-yellow-900 pb-1",
    }

    // Soft UI variants (opt-in; see UI_SOFT_GUIDE.md). Home uses the defaults above.
    const softVariants = {
        sale: "soft-badge-sale",
        danger: "soft-badge-danger",
        neutral: "soft-badge-neutral",
        success: "soft-badge-success",
        warning: "soft-badge-warning",
    }

    if (softVariants[variant]) {
        return <span className={`soft-badge ${softVariants[variant]} ${className}`}>{children}</span>
    }

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    )
}
