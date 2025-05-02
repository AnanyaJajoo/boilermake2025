"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type FloatingEmoji = {
  id: number
  emoji: string
  x: number
  y: number
  size: number
  rotate: number
  duration: number
  delay: number
}

const EMOJIS = ['✨', '💬', '🎭', '🤖', '💡', '🔮', '🎬', '📱', '💻', '🎯', '🚀', '💼', '🎨', '🎤']

export function AnimatedEmojiBackground() {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([])
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Generate initial emojis
    const generateEmojis = () => {
      const newEmojis: FloatingEmoji[] = []
      const count = Math.max(25, Math.floor(dimensions.width / 60))

      for (let i = 0; i < count; i++) {
        newEmojis.push({
          id: i,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: Math.random() * 25 + 20,
          rotate: Math.random() * 360,
          duration: Math.random() * 15 + 15,
          delay: Math.random() * 5
        })
      }
      setEmojis(newEmojis)
    }

    generateEmojis()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [dimensions.width, dimensions.height])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.25]">
      {emojis.map((emoji) => (
        <motion.div
          key={emoji.id}
          className="absolute select-none"
          initial={{
            x: emoji.x,
            y: emoji.y,
            rotate: emoji.rotate,
            scale: 0
          }}
          animate={{
            x: [emoji.x, emoji.x + Math.random() * 100 - 50, emoji.x],
            y: [emoji.y, emoji.y - 100 - Math.random() * 200, emoji.y + 100],
            rotate: [emoji.rotate, emoji.rotate + (Math.random() > 0.5 ? 180 : -180)],
            scale: [0, 1, 0.8, 1, 0]
          }}
          transition={{
            duration: emoji.duration,
            delay: emoji.delay,
            repeat: Infinity,
            ease: [0.76, 0, 0.24, 1]
          }}
          style={{
            fontSize: `${emoji.size}px`
          }}
        >
          {emoji.emoji}
        </motion.div>
      ))}
      
      {/* Gradient Blobs */}
      <motion.div 
        className="absolute rounded-full bg-pink-400/20 blur-[100px] w-[30vw] h-[30vw]"
        initial={{ x: '10%', y: '20%' }}
        animate={{ 
          x: ['10%', '15%', '10%'],
          y: ['20%', '25%', '20%'],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute rounded-full bg-purple-400/20 blur-[100px] w-[40vw] h-[40vw]"
        initial={{ x: '60%', y: '40%' }}
        animate={{ 
          x: ['60%', '55%', '60%'],
          y: ['40%', '35%', '40%'],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      
      <motion.div 
        className="absolute rounded-full bg-blue-400/20 blur-[100px] w-[25vw] h-[25vw]"
        initial={{ x: '30%', y: '70%' }}
        animate={{ 
          x: ['30%', '35%', '30%'],
          y: ['70%', '65%', '70%'],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 8 }}
      />
      
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-20" />
    </div>
  )
}
