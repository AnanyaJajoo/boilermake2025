"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users, Plus, Menu, X } from "lucide-react"
import { AnimatedLogo } from "@/components/animated-logo"
import Link from "next/link"

interface FloatingNavbarProps {
  alwaysShow?: boolean
}

export function FloatingNavbar({ alwaysShow = false }: FloatingNavbarProps) {
  const [isVisible, setIsVisible] = useState(alwaysShow)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    setIsMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Animation variants
  const navItemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    }
  }

  const mobileMenuVariants = {
    closed: { 
      opacity: 0, 
      scale: 0.95, 
      y: -20,
      transition: { 
        duration: 0.2, 
        ease: [0.76, 0, 0.24, 1]
      }
    },
    open: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.3, 
        ease: [0.76, 0, 0.24, 1]
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed top-6 left-0 right-0 z-50 px-4"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="mx-auto max-w-5xl flex justify-center">
            <motion.div
              className="bg-white/90 backdrop-blur-lg rounded-full shadow-lg px-4 py-2 flex items-center justify-between w-full"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Logo */}
              <div className="flex items-center mr-2">
                <AnimatedLogo />
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-3">
                <NavItem 
                  icon={<Home size={18} />} 
                  label="Home" 
                  onClick={() => navigateTo("/")} 
                />
                <NavItem 
                  icon={<Users size={18} />} 
                  label="Customers" 
                  onClick={() => navigateTo("/customers")} 
                />

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigateTo("/create")}
                    size="sm"
                    className="rounded-full gap-1.5 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 shadow-md hover:shadow-pink-400/20 hover:shadow-lg relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center">
                      <Plus size={16} className="mr-1 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Create Persona</span>
                    </span>
                    
                    {/* Animated background gradient */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600"
                      animate={{ 
                        x: ["0%", "100%", "0%"],
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                      }}
                      transition={{ 
                        duration: 8, 
                        repeat: Infinity,
                        ease: "linear" 
                      }}
                    />
                  </Button>
                </motion.div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden">
                <motion.button
                  className="p-2 rounded-full bg-gray-100 text-gray-700"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.button>
              </div>
            </motion.div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden"
                  variants={mobileMenuVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <div className="p-4 space-y-2">
                    <MobileNavItem 
                      icon={<Home size={18} />} 
                      label="Home" 
                      onClick={() => navigateTo("/")} 
                    />
                    <MobileNavItem 
                      icon={<Users size={18} />} 
                      label="Customers" 
                      onClick={() => navigateTo("/customers")} 
                    />
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <Button
                        onClick={() => navigateTo("/create")}
                        className="w-full justify-center rounded-xl gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
                      >
                        <Plus size={16} className="mr-1" />
                        <span>Create Persona</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Navigation Item Component
function NavItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative group px-4 py-2 rounded-full transition-colors hover:bg-gray-100"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="flex items-center gap-2">
        <span className="text-gray-700">{icon}</span>
        <span className="font-medium text-sm text-gray-800">{label}</span>
      </span>
      <motion.div
        className="absolute bottom-1 left-4 right-4 h-0.5 bg-pink-500 origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

// Mobile Navigation Item Component
function MobileNavItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors"
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-gray-700">
        {icon}
      </span>
      <span className="font-medium text-sm text-gray-800">{label}</span>
    </motion.button>
  )
}
