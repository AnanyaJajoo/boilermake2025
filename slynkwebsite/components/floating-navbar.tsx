"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users } from "lucide-react"
import { Logo } from "@/components/logo"

interface FloatingNavbarProps {
  alwaysShow?: boolean
}

export function FloatingNavbar({ alwaysShow = false }: FloatingNavbarProps) {
  const [isVisible, setIsVisible] = useState(alwaysShow)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (alwaysShow) {
      setIsVisible(true)
      return
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show navbar when scrolling down past 100px
      if (currentScrollY > 100) {
        setIsVisible(true)
      }
      // Hide navbar only when scrolling back to the very top
      else if (currentScrollY <= 10) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY, alwaysShow])

  const navigateTo = (path: string) => {
    router.push(path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white/90 backdrop-blur-lg rounded-full shadow-lg px-4 py-2 flex items-center gap-4"
          >
            {/* Logo on the left */}
            <div className="flex items-center mr-2">
              <Logo />
            </div>

            <motion.button
              onClick={() => navigateTo("/")}
              className="relative group px-4 py-2 rounded-full transition-colors hover:bg-gray-100"
            >
              <span className="flex items-center gap-2">
                <Home size={18} className="text-gray-700" />
                <span className="font-medium text-sm text-gray-800">Home</span>
              </span>
              <motion.div
                className="absolute bottom-1 left-4 right-4 h-0.5 bg-pink-500 origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              onClick={() => navigateTo("/customers")}
              className="relative group px-4 py-2 rounded-full transition-colors hover:bg-gray-100"
            >
              <span className="flex items-center gap-2">
                <Users size={18} className="text-gray-700" />
                <span className="font-medium text-sm text-gray-800">Customers</span>
              </span>
              <motion.div
                className="absolute bottom-1 left-4 right-4 h-0.5 bg-pink-500 origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <Button
              onClick={() => navigateTo("/create")}
              size="sm"
              className="rounded-full gap-1.5 text-sm font-medium bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90"
            >
              <span>Create</span>
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
