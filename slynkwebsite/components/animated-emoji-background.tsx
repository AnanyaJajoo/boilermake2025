"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface EmojiParticle {
  emoji: string
  initialX: number
  initialY: number
  targetX: number
  targetY: number
  size: number
  rotation: number
  opacity: number
  duration: number
  delay: number
}

const EMOJIS = [
  "👨",
  "👩",
  "👱‍♀️",
  "👱",
  "👴",
  "👵",
  "👲",
  "👳‍♀️",
  "👳",
  "🧔",
  "👼",
  "🤖",
  "👽",
  "🦸‍♀️",
  "🦸",
  "🦹‍♀️",
  "🦹",
]

export function AnimatedEmojiBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<EmojiParticle[]>([])
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 })
  const [key, setKey] = useState(0) // Force re-render key

  // Initialize particles on mount and window resize
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (!containerRef.current) return

      const { width, height } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height })

      // Create new particles with proper dimensions
      const newParticles = Array.from({ length: 20 }).map(() => {
        const initialX = Math.random() * width
        const initialY = Math.random() * height
        
        return {
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          initialX,
          initialY,
          targetX: initialX + (Math.random() * 200 - 100),
          targetY: initialY + height, // Always move downward
          size: Math.random() * 20 + 20,
          rotation: Math.random() * 360,
          opacity: Math.random() * 0.5 + 0.2,
          duration: Math.random() * 20 + 15, // Longer durations for smoother movement
          delay: Math.random() * 2,
        }
      })

      setParticles(newParticles)
    }

    // Initial setup
    updateDimensions()

    // Set up resize listener
    window.addEventListener('resize', updateDimensions)

    // Set up interval to refresh particles periodically
    const intervalId = setInterval(() => {
      setKey(prev => prev + 1)
    }, 30000) // Refresh every 30 seconds to keep it fresh

    return () => {
      window.removeEventListener('resize', updateDimensions)
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0" key={key}>
      {particles.map((particle, index) => (
        <motion.div
          key={`${index}-${key}`}
          className="absolute select-none"
          initial={{ 
            x: particle.initialX, 
            y: particle.initialY,
            rotate: 0
          }}
          animate={{ 
            x: particle.targetX, 
            y: particle.targetY,
            rotate: particle.rotation * 2
          }}
          transition={{
            x: { 
              duration: particle.duration,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              delay: particle.delay
            },
            y: { 
              duration: particle.duration,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              delay: particle.delay
            },
            rotate: { 
              duration: particle.duration * 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              delay: particle.delay
            }
          }}
          style={{
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}

      {/* Geometric shapes */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-pink-200/10 blur-3xl" 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 8,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-200/10 blur-3xl"
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 10,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-40 h-40 rounded-lg bg-purple-200/10 blur-2xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 15, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 12,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-10"
        style={{ backgroundSize: "24px 24px" }}
      />
    </div>
  )
}
