"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Home, MessageSquare, ImageIcon, FileText, Settings, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface NavItemProps {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm ${
        active ? "bg-pink-50 text-pink-600" : "text-gray-600 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-pink-500"
        />
      )}
    </Button>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState("Chat")

  const navItems = [
    { icon: Home, label: "Home" },
    { icon: MessageSquare, label: "Chat" },
    { icon: ImageIcon, label: "Images" },
    { icon: FileText, label: "Documents" },
    { icon: Settings, label: "Settings" },
  ]

  return (
    <div
      className={`flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && <Logo />}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="px-3 py-2">
        <Button
          className="w-full gap-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90"
          size="sm"
        >
          <PlusCircle size={16} />
          {!collapsed && <span>New Chat</span>}
        </Button>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={collapsed ? "" : item.label}
            active={activeItem === item.label}
            onClick={() => setActiveItem(item.label)}
          />
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            <div>
              <p className="text-sm font-medium">User Name</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
