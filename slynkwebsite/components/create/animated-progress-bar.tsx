"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface Step {
  name: string
  description: string
}

interface AnimatedProgressBarProps {
  currentStep: number
  steps: Step[]
}

export function AnimatedProgressBar({ currentStep, steps }: AnimatedProgressBarProps) {
  const [width, setWidth] = useState(0)
  const totalSteps = steps.length

  useEffect(() => {
    if (totalSteps <= 1) {
      setWidth(100)
    } else {
      setWidth((currentStep / (totalSteps - 1)) * 100)
    }
  }, [currentStep, totalSteps])

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="text-center" style={{ width: `${100 / totalSteps}%` }}>
            <div className="mb-2 text-sm font-medium">
              <span className={index <= currentStep ? "text-pink-600" : "text-gray-400"}>
                {step.name}
              </span>
            </div>
          </div>
        ))}
      </div>
      
    <div className="relative h-2 w-full rounded-full bg-gray-100">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600"
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <div className="absolute -top-1 flex w-full justify-between">
          {steps.map((_, index) => (
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
    </div>
  )
}
