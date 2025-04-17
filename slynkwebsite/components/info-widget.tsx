"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

interface InfoWidgetProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  color: string
  index?: number
}

export function InfoWidget({ title, value, description, icon, color, index = 0 }: InfoWidgetProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 ${
        isHovered ? "shadow-lg" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 opacity-5 ${color}`} />

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-transparent to-transparent">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: "0%" }}
          animate={{ width: isHovered ? "100%" : "0%" }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className={`rounded-full p-2 ${color} bg-opacity-10`}>{icon}</div>
          <motion.div animate={{ rotate: isHovered ? 90 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </motion.div>
        </div>

        <h3 className="mb-1 text-sm font-medium text-gray-500">{title}</h3>
        <div className="mb-2 flex items-end gap-1">
          <span className={`text-2xl font-bold ${color.replace("bg-", "text-")}`}>{value}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}
