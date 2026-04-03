import React from 'react'

function Spinner({ variant = "dark", size = "md", className = "" }) {
    const colorClass = variant === "light"
        ? "border-white/90 border-t-transparent"
        : "border-violet-700 border-t-transparent"

    const sizeClass = size === "sm" ? "w-5 h-5 border-2" : "w-10 h-10 border-4"

    return (
        <div className={`rounded-full animate-spin ${colorClass} ${sizeClass} ${className}`}></div>
    )
}

export default Spinner