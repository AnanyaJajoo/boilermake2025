import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "gradient"
  label?: string
}

export function Spinner({
  size = "md",
  variant = "default",
  label,
  className,
  ...props
}: SpinnerProps) {
  // Map sizes to actual dimensions
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12", 
    xl: "h-16 w-16"
  }
  
  // Calculate bar heights based on size
  const barSizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
    xl: "h-5"
  }
  
  const barWidths = {
    sm: "w-0.5",
    md: "w-1",
    lg: "w-1.5",
    xl: "w-2"
  }
  
  return (
    <div 
      className={cn("flex flex-col items-center justify-center", className)}
      {...props}
    >
      <div className={cn("relative", sizeClasses[size])}>
        {/* First animation group - rotating bars */}
        <div className="absolute inset-0">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute left-1/2 bottom-1/2",
                barWidths[size],
                barSizes[size],
                variant === "gradient" 
                  ? "bg-gradient-to-t from-pink-500 to-purple-600" 
                  : "bg-pink-500"
              )}
              style={{
                transformOrigin: "center bottom",
                rotate: i * 60,
                borderRadius: "2px",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
              }}
              initial={{ opacity: 0.3, scaleY: 0.7 }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scaleY: [0.7, 1, 0.7],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Subtle glow effect */}
        {variant === "gradient" && (
          <div className="absolute inset-0 rounded-full bg-pink-500/10 animate-pulse blur-md" />
        )}
      </div>
      
      {/* Optional label */}
      {label && (
        <span className="mt-3 text-sm text-gray-600 font-medium animate-pulse">
          {label}
        </span>
      )}
    </div>
  )
} 