"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FloatingActionButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
        setIsExpanded(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <div className="relative">
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: -60 }}
                  exit={{ opacity: 0, scale: 0.8, y: 0 }}
                  className="absolute bottom-full mb-2 left-0"
                >
                  <Link href="/create">
                    <Button className="rounded-full shadow-lg bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90">
                      <MessageSquare className="h-4 w-4" />
                      <span className="ml-2">Get Started</span>
                    </Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={scrollToTop}
              className="rounded-full shadow-lg bg-white text-pink-500 hover:bg-gray-50"
              size="icon"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>

            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute -top-2 -right-2 rounded-full shadow-md bg-white border border-gray-200 hover:bg-gray-50"
              size="icon"
              variant="ghost"
            >
              {isExpanded ? (
                <X className="h-3 w-3 text-gray-500" />
              ) : (
                <span className="h-3 w-3 rounded-full bg-pink-500" />
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
