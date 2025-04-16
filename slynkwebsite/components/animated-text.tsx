"use client"

import { useState, useEffect } from "react"

interface AnimatedTextProps {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  delayBetweenWords?: number
}

export function AnimatedText({
  words,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenWords = 2000,
}: AnimatedTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        // If we're deleting
        if (isDeleting) {
          setCurrentText((prev) => prev.substring(0, prev.length - 1))

          // If we've deleted everything, start typing the next word
          if (currentText === "") {
            setIsDeleting(false)
            setCurrentWordIndex((prev) => (prev + 1) % words.length)
          }
        }
        // If we're paused between words
        else if (isPaused) {
          setIsPaused(false)
          setIsDeleting(true)
        }
        // If we're typing
        else {
          const currentWord = words[currentWordIndex]
          setCurrentText((prev) => currentWord.substring(0, prev.length + 1))

          // If we've typed the full word, pause before deleting
          if (currentText === currentWord) {
            setIsPaused(true)
          }
        }
      },
      isPaused ? delayBetweenWords : isDeleting ? deletingSpeed : typingSpeed,
    )

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, isPaused, currentWordIndex, words, typingSpeed, deletingSpeed, delayBetweenWords])

  return (
    <span className="inline-block min-w-[120px]">
      {currentText}
      <span className="animate-blink">|</span>
    </span>
  )
}
