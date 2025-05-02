import React from "react"
import { cn } from "@/lib/utils"

interface CircularSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "gradient" | "outline"
  label?: string
}

export function CircularSpinner({
  size = "md",
  variant = "default",
  label,
  className,
  ...props
}: CircularSpinnerProps) {
  // Map sizes to actual dimensions
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-10 w-10",
    lg: "h-16 w-16", 
    xl: "h-24 w-24"
  }
  
  // SVG viewbox is always 50x50 for consistency
  const viewBox = "0 0 50 50"
  
  // Circle radius and stroke width based on size
  const getRadius = () => {
    switch(size) {
      case "sm": return 18
      case "md": return 20
      case "lg": return 21
      case "xl": return 22
      default: return 20
    }
  }
  
  const getStrokeWidth = () => {
    switch(size) {
      case "sm": return 3
      case "md": return 3
      case "lg": return 3.5
      case "xl": return 4
      default: return 3
    }
  }
  
  // Colors based on variant
  const getColors = () => {
    switch(variant) {
      case "gradient":
        return {
          primary: "url(#spinner-gradient)",
          secondary: "url(#spinner-gradient-light)",
          glow: true
        }
      case "outline":
        return {
          primary: "transparent",
          secondary: "#ec4899",
          glow: false
        }
      case "default":
      default:
        return {
          primary: "#ec4899",
          secondary: "#ec489980",
          glow: false
        }
    }
  }
  
  const radius = getRadius()
  const strokeWidth = getStrokeWidth()
  const colors = getColors()
  
  return (
    <div className={cn("flex flex-col items-center justify-center", className)} {...props}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg 
          viewBox={viewBox} 
          className={cn("animate-spinner-rotate", sizeClasses[size])}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="spinner-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec489950" />
              <stop offset="100%" stopColor="#8b5cf650" />
            </linearGradient>
            {colors.glow && (
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            )}
          </defs>
          
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            fill="none"
            stroke={colors.secondary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="1, 3"
            className="opacity-50"
          />
          
          {/* Animated circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            fill="none"
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="animate-spinner-dash"
            filter={colors.glow ? "url(#glow)" : undefined}
          />
          
          {/* Small dot indicators */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const radians = angle * Math.PI / 180
            const x = 25 + (radius + 3) * Math.cos(radians)
            const y = 25 + (radius + 3) * Math.sin(radians)
            
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={strokeWidth / 3}
                fill={colors.primary}
                className="animate-spinner-scale"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            )
          })}
        </svg>
        
        {/* Subtle glow effect for gradient variant */}
        {variant === "gradient" && (
          <div className="absolute inset-0 rounded-full bg-pink-500/10 animate-spinner-glow" />
        )}
      </div>
      
      {/* Optional label */}
      {label && (
        <div className="mt-3 text-sm text-gray-600 font-medium">{label}</div>
      )}
    </div>
  )
} 