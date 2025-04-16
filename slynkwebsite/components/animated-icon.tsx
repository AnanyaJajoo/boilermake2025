"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface AnimatedIconProps {
  icon: LucideIcon
  color?: string
  size?: number
  className?: string
}

export function AnimatedIcon({ icon: Icon, color = "text-pink-500", size = 24, className = "" }: AnimatedIconProps) {
  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300,
      },
    },
  }

  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      variants={iconVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-current opacity-20 blur-xl rounded-full" />
        <Icon size={size} className={`relative z-10 ${color}`} />
      </div>
    </motion.div>
  )
}
