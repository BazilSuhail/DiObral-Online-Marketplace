import { Link } from "react-router-dom"

export default function Button ({ children, variant = "primary", size = "md", className = "", asChild, ...props }) {
    const baseClasses =
        "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

    const variants = {
        primary: "bg-black text-white hover:bg-gray-800 focus:ring-gray-500",
        red: "bg-red-800 text-white hover:bg-red-800 focus:ring-gray-500",
        green: "bg-green-800 text-white hover:bg-green-800 focus:ring-gray-500",
        blue: "bg-blue-600 text-white hover:bg-blue-800 focus:ring-gray-500",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500", 
    }

    const sizes = {
        sm: "px-3 py-2 text-sm rounded-md",
        md: "px-4 py-2 text-sm rounded-md",
        lg: "px-6 py-3 text-base rounded-lg",
    }

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

    if (asChild && children?.type === Link) {
        return (
            <Link {...children.props} className={classes}>
                {children.props.children}
            </Link>
        )
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    )
}
