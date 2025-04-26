"use client"

import { Logo } from "@/components/logo"

export function TopHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-transparent">
        <Logo />
      </div>
    </header>
  )
}
