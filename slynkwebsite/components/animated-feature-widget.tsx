"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface AnimatedFeatureWidgetProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  index?: number
  direction?: "left" | "right"
}

export function AnimatedFeatureWidget({
  title,
  description,
  icon: Icon,
  color,
  index = 0,
  direction = "left",
}: AnimatedFeatureWidgetProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 ${
        isHovered ? "shadow-lg" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 opacity-5 ${color}`} />

      <motion.div
        className={`absolute bottom-0 left-0 h-1 w-full ${color}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ originX: direction === "left" ? 0 : 1 }}
      />

      <div className="relative z-10">
        <div className={`mb-4 inline-flex rounded-full p-3 ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>

        <motion.div
          className="mt-4 h-0.5 w-12 bg-gradient-to-r from-pink-400 to-pink-600"
          animate={{ width: isHovered ? "40%" : "3rem" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}
