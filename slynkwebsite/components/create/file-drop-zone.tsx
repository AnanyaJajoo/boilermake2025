"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ImageIcon, File, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import type React from "react"

interface FileDropZoneProps {
  label: string
  accept?: string
  icon?: "image" | "file" | "audio"
  onChange: (file: File | null) => void
  value: File | null
  previewUrl?: string
}

export function FileDropZone({ label, accept = "*/*", icon = "file", onChange, value, previewUrl }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(previewUrl || null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        onChange(file)

        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = () => {
            setPreview(reader.result as string)
          }
          reader.readAsDataURL(file)
        } else {
          setPreview(null)
        }
      }
    },
    [onChange],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        onChange(file)

        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = () => {
            setPreview(reader.result as string)
          }
          reader.readAsDataURL(file)
        } else {
          setPreview(null)
        }
      }
    },
    [onChange],
  )

  const removeFile = useCallback(() => {
    onChange(null)
    setPreview(null)
  }, [onChange])

  const getIcon = () => {
    switch (icon) {
      case "image":
        return <ImageIcon size={32} className="mb-2 text-pink-400" />
      case "audio":
        return <Mic size={32} className="mb-2 text-pink-400" />
      default:
        return <File size={32} className="mb-2 text-pink-400" />
    }
  }

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      {!value ? (
        <div
          className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-all ${
            isDragging ? "border-pink-400 bg-pink-50" : "border-gray-300 hover:border-pink-300 hover:bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-input-${label}`)?.click()}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            {getIcon()}
            <p className="mb-1 text-sm text-gray-500">
              <span className="font-medium text-pink-500">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              {icon === "image" ? "PNG, JPG or GIF" : icon === "audio" ? "MP3 or WAV" : "PDF, DOC, etc."}
            </p>
          </motion.div>
          <input
            id={`file-input-${label}`}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative rounded-lg border border-gray-200"
          >
            {preview ? (
              <div className="relative h-40 w-full overflow-hidden rounded-lg">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center p-4">
                <div className="flex items-center gap-3">
                  {getIcon()}
                  <div>
                    <p className="text-sm font-medium">{value.name}</p>
                    <p className="text-xs text-gray-500">{(value.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 text-gray-500 hover:bg-white hover:text-red-500"
              onClick={removeFile}
            >
              <X size={16} />
            </Button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
