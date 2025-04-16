"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, File, ImageIcon, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
}

export function FileUpload() {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type,
        size: file.size,
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type,
        size: file.size,
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={20} className="text-blue-500" />
    if (type.includes("pdf")) return <FileText size={20} className="text-red-500" />
    return <File size={20} className="text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="mb-4 gap-2 border-dashed border-gray-300">
        <Upload size={16} />
        <span>Upload Files</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`mb-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                isDragging ? "border-pink-400 bg-pink-50" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="mb-1 text-sm text-gray-600">Drag and drop files here, or</p>
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-pink-500 hover:text-pink-600">browse files</span>
                <input type="file" className="hidden" multiple onChange={handleFileChange} />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Uploaded Files</h3>
          <div className="rounded-lg border border-gray-200">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between border-b border-gray-200 p-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => removeFile(file.id)}
                >
                  <X size={16} />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
