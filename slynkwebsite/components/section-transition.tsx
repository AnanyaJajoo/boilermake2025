"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface SectionTransitionProps {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  className?: string
}

export function SectionTransition({ children, direction = "up", delay = 0, className = "" }: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Define transform values based on direction
  const getTransformValues = () => {
    switch (direction) {
      case "up":
        return { y: [100, 0] }
      case "down":
        return { y: [-100, 0] }
      case "left":
        return { x: [100, 0] }
      case "right":
        return { x: [-100, 0] }
      default:
        return { y: [100, 0] }
    }
  }

  const transformValues = getTransformValues()
  const xProgress = "x" in transformValues ? scrollYProgress : null
  const yProgress = "y" in transformValues ? scrollYProgress : null

  const x = xProgress ? useTransform(xProgress, [0, 1], transformValues.x) : undefined
  const y = yProgress ? useTransform(yProgress, [0, 1], transformValues.y) : undefined
  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 1, 1])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ x, y, opacity }} transition={{ delay }}>
        {children}
      </motion.div>
    </div>
  )
}
