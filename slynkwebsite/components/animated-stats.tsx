"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"

interface StatProps {
  value: number
  label: string
  suffix?: string
  color?: string
  duration?: number
  delay?: number
}

function Stat({ value, label, suffix = "", color = "text-pink-500", duration = 2, delay = 0 }: StatProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const increment = end / (duration * 60) // 60fps

      setTimeout(() => {
        const timer = setInterval(() => {
          start += increment
          setCount(Math.min(Math.floor(start), end))

          if (start >= end) {
            clearInterval(timer)
          }
        }, 16.67) // ~60fps

        return () => clearInterval(timer)
      }, delay * 1000)
    }
  }, [isInView, value, duration, delay])

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay }}
        className="mb-2"
      >
        <span className={`text-4xl font-bold ${color}`}>
          {count}
          {suffix}
        </span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
        className="text-gray-600"
      >
        {label}
      </motion.p>
    </div>
  )
}

export function AnimatedStats() {
  return (
    <div className="py-12 bg-gradient-to-r from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
            Our Impact
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how Voxen is transforming digital interactions across industries
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value={10000} label="Active Users" suffix="+" color="text-blue-500" delay={0} />
          <Stat value={45} label="Engagement Increase" suffix="%" color="text-pink-500" delay={0.2} />
          <Stat value={60} label="Support Time Reduced" suffix="%" color="text-purple-500" delay={0.4} />
          <Stat value={24} label="Industries Served" color="text-teal-500" delay={0.6} />
        </div>
      </div>
    </div>
  )
}
