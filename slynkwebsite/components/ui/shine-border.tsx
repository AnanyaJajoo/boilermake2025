"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"
import { motion, HTMLMotionProps } from "framer-motion"

interface ShineBorderProps extends Omit<HTMLMotionProps<"div">, "children"> {
  isActive?: boolean
  borderClassName?: string
  strength?: number
  angle?: number
  borderWidth?: number
  borderColor?: string
  children: React.ReactNode
}

export function ShineBorder({
  isActive = true,
  borderClassName = "",
  strength = 1,
  angle = 45,
  borderWidth = 1,
  borderColor = "rgba(255, 255, 255, 0.3)",
  className,
  children,
  ...props
}: ShineBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isHovering) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      setCoords({ x, y })
    }
    
    window.addEventListener("mousemove", handleMouseMove)
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isHovering])

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative z-0", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      {...props}
    >
      {isActive && (
        <div
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden -z-10 transition-opacity duration-500",
            isHovering ? "opacity-100" : "opacity-80",
            borderClassName
          )}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{
              background: isHovering 
                ? `radial-gradient(circle at ${coords.x}% ${coords.y}%, rgba(255, 255, 255, ${0.1 * strength}), transparent 45%)`
                : `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, ${0.05 * strength}), transparent 35%)`,
              transform: `scale(1.03)`,
            }}
          />
          
          <div
            className="absolute -inset-[1px] bg-gradient-to-r from-pink-400/30 via-purple-500/30 to-blue-500/30 rounded-2xl opacity-80 animate-border-flow"
            style={{
              maskImage: "radial-gradient(black, transparent 70%)",
              WebkitMaskImage: "radial-gradient(black, transparent 70%)",
            }}
          />
          
          <div 
            className="absolute inset-0" 
            style={{ 
              background: `linear-gradient(${angle}deg, transparent, ${borderColor}, transparent)`,
              backgroundSize: "200% 200%",
              animation: "border-flow 6s linear infinite"
            }} 
          />
        </div>
      )}
      
      <div className="relative">{children}</div>
    </motion.div>
  )
}

interface ShineCardProps {
  children: React.ReactNode
  className?: string
}

export function ShineCard({ className, children }: ShineCardProps) {
  return (
    <ShineBorder className={className}>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-100/30">
        {children}
      </div>
    </ShineBorder>
  )
}
