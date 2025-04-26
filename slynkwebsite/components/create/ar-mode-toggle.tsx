"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { BoxSelect, Smartphone, Info } from "lucide-react"

interface ARModeToggleProps {
  onToggle: (isARMode: boolean) => void
  isARMode: boolean
  disabled?: boolean
}

export function ARModeToggle({ onToggle, isARMode, disabled = false }: ARModeToggleProps) {
  const [showInfo, setShowInfo] = useState(false)

  const handleToggle = () => {
    if (!disabled) {
      onToggle(!isARMode)
    }
  }

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 p-3">
        <div className="flex items-center">
          {isARMode ? (
            <BoxSelect className="mr-2 h-5 w-5 text-pink-500" />
          ) : (
            <Smartphone className="mr-2 h-5 w-5 text-gray-500" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isARMode ? "AR Mode" : "Chat Mode"}
            </p>
            <p className="text-xs text-gray-500">
              {isARMode 
                ? "Experience the AI in augmented reality" 
                : "Standard chat interface"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Info</span>
          </Button>
          <Switch
            checked={isARMode}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
        </div>
      </div>
      
      {showInfo && (
        <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg bg-white p-3 shadow-lg ring-1 ring-gray-200">
          <p className="text-xs text-gray-600">
            <strong>AR Mode:</strong> Uses your device camera to show the AI in your environment through augmented reality. Requires camera access and a compatible device.
          </p>
          <p className="mt-2 text-xs text-gray-600">
            <strong>Chat Mode:</strong> Standard interface with text messages and an avatar video.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 w-full text-xs"
            onClick={() => setShowInfo(false)}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  )
} 