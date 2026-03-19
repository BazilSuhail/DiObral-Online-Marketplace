export default function Badge({ children, variant = "default", className = "" }) {
    const variants = {
        default: "bg-black text-white",
        secondary: "bg-gray-100 text-gray-900",
        destructive: "bg-red-500 text-white", 
        pending: "bg-yellow-100 text-yellow-900 pb-1",
    }

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    )
}