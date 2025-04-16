"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface AnimatedProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function AnimatedProgressBar({ currentStep, totalSteps }: AnimatedProgressBarProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    setWidth((currentStep / totalSteps) * 100)
  }, [currentStep, totalSteps])

  return (
    <div className="relative h-2 w-full rounded-full bg-gray-100">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600"
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <div className="absolute -top-1 flex w-full justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className={`h-4 w-4 rounded-full ${
              index < currentStep ? "bg-pink-500" : index === currentStep ? "bg-pink-300" : "bg-gray-200"
            }`}
            initial={{ scale: 0.8 }}
            animate={{
              scale: index === currentStep ? 1.2 : 1,
              backgroundColor: index < currentStep ? "#ec4899" : index === currentStep ? "#f472b6" : "#e5e7eb",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  )
}
