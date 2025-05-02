"use client"

import { useState } from "react"
import { motion, AnimatePresence, useMotionValueEvent, useScroll, useMotionValue } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AnimatedLogo } from "@/components/animated-logo"

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Customers", href: "/customers" },
  { label: "Use Cases", href: "/use-cases" },
]

// Animation variants for consistent transitions
const navContainerVariants = {
  expanded: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.4,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  collapsed: { 
    y: -60, 
    opacity: 0,
    transition: { 
      duration: 0.3,
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

const navItemVariants = {
  expanded: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  collapsed: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
}

const pillVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 30,
      when: "beforeChildren"
    }
  }
}

export function DynamicNavbar() {
  const [navState, setNavState] = useState<number>(0) // 0-1 range for transition
  const router = useRouter()
  const { scrollY } = useScroll()
  
  // Create motion values for smooth transitions
  const navProgress = useMotionValue(0)
  
  // Track scroll position to update the navbar state with a smoother range
  useMotionValueEvent(scrollY, "change", (latest) => {
    // Start transition at 50px, complete at 200px (longer range)
    const scrollProgress = Math.min(Math.max((latest - 50) / 150, 0), 1)
    setNavState(scrollProgress)
    navProgress.set(scrollProgress)
  })

  // Use scrollY value to determine if we should show the pill navbar
  const shouldShowPill = navState > 0.8
  
  // Handle navigation
  const navigateTo = (path: string) => {
    router.push(path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* Top spread-out navigation when at top of page */}
      <motion.header 
        className="fixed top-0 left-0 w-full z-50 px-6 py-6"
        style={{ opacity: 1 - navState }}
        variants={navContainerVariants}
        initial="collapsed"
        animate={navState < 0.9 ? "expanded" : "collapsed"}
        key="spread-navbar"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          {/* Logo on the left */}
          <motion.div
            variants={navItemVariants}
            className="transform-gpu"
            layoutId="logo-container"
          >
            <AnimatedLogo />
          </motion.div>
          
          {/* Nav Links in center on the same line */}
          <motion.div 
            className="absolute left-0 right-0 flex justify-center items-center h-full"
            variants={navItemVariants}
          >
            <nav className="flex items-center space-x-8">
              {NAV_ITEMS.map((item, index) => (
                <WideNavButton 
                  key={item.label}
                  label={item.label}
                  href={item.href}
                  index={index}
                />
              ))}
            </nav>
          </motion.div>
          
          {/* Create Ad Button on the right */}
          <motion.div
            variants={navItemVariants}
            className="transform-gpu"
            layoutId="create-button-container"
          >
            <Button
              onClick={() => navigateTo("/create")}
              className="text-base font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 rounded-xl px-5 py-2 h-auto shadow-md shadow-pink-400/10 hover:shadow-pink-400/20 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <Plus size={18} />
                <span>Create Ad</span>
              </span>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Floating pill navbar when scrolled */}
      <AnimatePresence>
        {shouldShowPill && (
          <motion.div 
            className="fixed top-6 left-0 w-full z-50 px-4 flex justify-center"
            style={{ opacity: navState }}
            variants={pillVariants}
            initial="hidden"
            animate="visible"
            exit={{ y: -100, opacity: 0, transition: { duration: 0.3 } }}
            key="pill-navbar"
          >
            <motion.div 
              className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-full shadow-xl px-6 py-3 flex items-center justify-between gap-6"
              initial={{ width: "60%" }}
              animate={{ width: "80%" }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
              style={{ maxWidth: "900px" }}
            >
              {/* Logo */}
              <motion.div
                className="transform-gpu"
                layoutId="logo-container"
              >
                <AnimatedLogo isAnimating={true} />
              </motion.div>
              
              {/* Nav Links */}
              <nav className="flex items-center space-x-6 mx-4">
                {NAV_ITEMS.map((item, index) => (
                  <PillNavButton
                    key={item.label}
                    label={item.label}
                    href={item.href}
                    index={index}
                  />
                ))}
              </nav>
              
              {/* Create Ad Button */}
              <motion.div
                layoutId="create-button-container"
              >
                <Button
                  onClick={() => navigateTo("/create")}
                  className="text-base font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 rounded-full px-5 py-2 h-auto shadow-md hover:shadow-pink-400/20 hover:shadow-lg transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={18} />
                    <span>Create Ad</span>
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Full-size navigation button for the spread-out navbar
function WideNavButton({ label, href, index }: { label: string, href: string, index: number }) {
  const router = useRouter()
  
  return (
    <motion.button
      onClick={() => router.push(href)}
      className="relative px-4 py-2 text-base font-medium text-gray-800 transition-colors hover:text-pink-600"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
      <motion.div
        className="absolute bottom-0 left-1 right-1 h-0.5 bg-pink-500 origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

// Compact navigation button for the pill navbar
function PillNavButton({ label, href, index }: { label: string, href: string, index: number }) {
  const router = useRouter()
  
  return (
    <motion.button
      onClick={() => router.push(href)}
      className="relative px-4 py-2 text-base font-medium text-gray-800 transition-colors hover:text-pink-600 rounded-full hover:bg-pink-50"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: { delay: 0.1 + (index * 0.05), duration: 0.3 }
      }}
      whileHover={{ y: -2, backgroundColor: "rgba(236, 72, 153, 0.1)" }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
      <motion.div
        className="absolute bottom-1 left-3 right-3 h-0.5 bg-pink-500 origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  )
} 