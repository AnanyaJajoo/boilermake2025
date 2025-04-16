"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

export function AnimatedScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    })
  }

  return (
    <motion.div
      className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer"
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20,
      }}
      transition={{ duration: 0.3 }}
      onClick={scrollToContent}
    >
      <motion.div
        className="flex flex-col items-center"
        animate={{ y: [0, 10, 0] }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      >
        <p className="mb-2 text-sm font-medium text-gray-600">Scroll to explore</p>
        <div className="rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm">
          <ChevronDown className="h-5 w-5 text-pink-500" />
        </div>
      </motion.div>
    </motion.div>
  )
}
