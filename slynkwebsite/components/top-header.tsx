"use client"

import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { Logo } from "@/components/logo"

interface TopHeaderProps {
  onSignInClick?: () => void
}

export function TopHeader({ onSignInClick }: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-transparent">
        <Logo />
        <Button variant="outline" size="sm" className="rounded-full gap-1.5" onClick={onSignInClick}>
          <LogIn size={16} />
          <span>Sign In</span>
        </Button>
      </div>
    </header>
  )
}
