"use client"

import { motion } from "framer-motion"
import type React from "react"

interface AnimatedCardProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function AnimatedCard({ children, delay = 0, className = "" }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
      className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-md ${className}`}
    >
      <motion.div
        className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-pink-200/30 to-purple-200/30 blur-2xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-200/30 to-teal-200/30 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 1,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
