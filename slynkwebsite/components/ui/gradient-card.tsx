import type React from "react"

interface GradientCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function GradientCard({ children, className = "", style = {} }: GradientCardProps) {
  return (
    <div
      className={`relative rounded-xl bg-gradient-to-b from-white to-pink-50 p-[1px] shadow-md overflow-hidden ${className}`}
      style={style}
    >
      <div className="relative rounded-xl bg-white p-6 z-10">{children}</div>
    </div>
  )
}
