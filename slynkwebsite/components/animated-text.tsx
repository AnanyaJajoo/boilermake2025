"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AnimatedTextProps {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  delayBetweenWords?: number
  className?: string
}

export function AnimatedText({
  words,
  typingSpeed = 100,
  deletingSpeed = 80,
  delayBetweenWords = 1500,
  className = "",
}: AnimatedTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (!isAnimating) return

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < words[currentWordIndex].length) {
          setCurrentText(words[currentWordIndex].substring(0, currentText.length + 1))
        } else {
          // Finished typing, wait and start deleting
          setTimeout(() => {
            setIsDeleting(true)
          }, delayBetweenWords)
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(words[currentWordIndex].substring(0, currentText.length - 1))
        } else {
          // Finished deleting, start typing the next word
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, currentWordIndex, delayBetweenWords, deletingSpeed, isAnimating, isDeleting, typingSpeed, words])

  const variants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 }
  }

  return (
    <span className={className}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentText}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration: 0.2,
            ease: "easeInOut"
          }}
        >
          {currentText}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="inline-block ml-[1px] w-[2px] h-[1.1em] bg-pink-400 relative top-[0.2em]"
          />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
