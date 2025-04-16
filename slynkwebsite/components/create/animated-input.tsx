"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type React from "react"

interface AnimatedInputProps {
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  multiline?: boolean
  rows?: number
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function AnimatedInput({
  label,
  type = "text",
  placeholder,
  required = false,
  multiline = false,
  rows = 3,
  name,
  value,
  onChange,
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="mb-4">
      <motion.label
        className="mb-1.5 block text-sm font-medium text-gray-700"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {label}
        {required && <span className="ml-1 text-pink-500">*</span>}
      </motion.label>
      <div className="relative">
        {multiline ? (
          <Textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full rounded-lg border-gray-300 focus:border-pink-300 focus:ring-pink-300"
          />
        ) : (
          <Input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full rounded-lg border-gray-300 focus:border-pink-300 focus:ring-pink-300"
          />
        )}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-gradient-to-r from-pink-400 to-pink-600"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}
