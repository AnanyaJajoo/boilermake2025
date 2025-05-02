"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface AnimatedLogoProps {
  isAnimating?: boolean
}

export function AnimatedLogo({ isAnimating = false }: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false)
  const shouldAnimate = isHovered || isAnimating
  
  return (
    <Link href="/" className="inline-block">
      <motion.div
        className="flex items-center gap-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Logo mark */}
        <motion.div 
          className="relative w-8 h-8"
        >
          {/* Background glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 blur-sm"
            animate={shouldAnimate ? {
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: shouldAnimate ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          
          {/* Logo shape */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white flex items-center justify-center"
            animate={shouldAnimate ? { rotate: 360 } : {}}
            transition={{ duration: 10, repeat: shouldAnimate ? Infinity : 0, ease: "linear" }}
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500"
              animate={shouldAnimate ? {
                background: [
                  "linear-gradient(to bottom right, rgb(236, 72, 153), rgb(168, 85, 247), rgb(99, 102, 241))",
                  "linear-gradient(to bottom right, rgb(99, 102, 241), rgb(236, 72, 153), rgb(168, 85, 247))",
                  "linear-gradient(to bottom right, rgb(168, 85, 247), rgb(99, 102, 241), rgb(236, 72, 153))",
                  "linear-gradient(to bottom right, rgb(236, 72, 153), rgb(168, 85, 247), rgb(99, 102, 241))"
                ]
              } : {}}
              transition={{ duration: 3, repeat: shouldAnimate ? Infinity : 0, ease: "linear" }}
            >
              <motion.div 
                className="w-4 h-4 absolute top-1 left-1 rounded-full bg-white/90"
                animate={shouldAnimate ? { 
                  x: [0, 2, -2, 0],
                  y: [0, -2, 2, 0]
                } : {}}
                transition={{ 
                  duration: 2, 
                  repeat: shouldAnimate ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Logo text */}
        <motion.div 
          className="text-xl font-bold text-gray-900"
          animate={shouldAnimate ? { color: "#db2777" } : {}}
          transition={{ duration: 0.3 }}
        >
          Slynk
          <motion.span
            className="text-pink-500 ml-[1px]"
            animate={shouldAnimate ? {
              opacity: [1, 0, 1],
              y: [0, -1, 0]
            } : {}}
            transition={{
              duration: 0.5,
              repeat: shouldAnimate ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            .
          </motion.span>
        </motion.div>
      </motion.div>
    </Link>
  )
} 