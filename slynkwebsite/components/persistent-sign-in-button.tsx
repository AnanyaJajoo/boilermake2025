"use client"

import { useState } from "react"
import { SignInPopup } from "@/components/sign-in-popup"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

interface PersistentSignInButtonProps {
  variant?: "default" | "subtle" | "outline" | "text"
  size?: "sm" | "default" | "lg"
  className?: string
  onSignInClick?: () => void
}

export function PersistentSignInButton({
  variant = "default",
  size = "default",
  className,
  onSignInClick,
}: PersistentSignInButtonProps) {
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  let buttonStyle = "bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:from-pink-500 hover:to-pink-700"
  
  if (variant === "subtle") {
    buttonStyle = "bg-pink-100 text-pink-600 hover:bg-pink-200"
  } else if (variant === "outline") {
    buttonStyle = "bg-transparent border border-pink-500 text-pink-500 hover:bg-pink-50"
  } else if (variant === "text") {
    buttonStyle = "bg-transparent text-pink-500 hover:text-pink-600 hover:underline"
  }

  let sizeStyle = "px-4 py-2 text-sm"
  
  if (size === "sm") {
    sizeStyle = "px-3 py-1 text-xs"
  } else if (size === "lg") {
    sizeStyle = "px-6 py-3 text-base"
  }

  return (
    <>
      <Button
        onClick={() => {
          setIsSignInOpen(true)
          onSignInClick?.()
        }}
        className={`flex items-center gap-2 font-medium rounded-lg ${buttonStyle} ${sizeStyle} ${className}`}
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </Button>
      <SignInPopup isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  )
}
