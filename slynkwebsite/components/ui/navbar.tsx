"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { 
  Home, 
  Plus, 
  Grid3x3, 
  MessageSquare, 
  Users, 
  LogOut,
  Menu,
  X
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? "bg-pink-50 text-pink-600" : "text-gray-600 hover:bg-gray-50"
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  const navigation = [
    { name: "Home", href: "/", icon: Home, active: pathname === "/" },
    { name: "Dashboard", href: "/dashboard", icon: Grid3x3, active: pathname === "/dashboard" },
    { name: "Create", href: "/create", icon: Plus, active: pathname === "/create" },
    { name: "Customers", href: "/customers", icon: Users, active: pathname === "/customers" },
  ]

  if (!session) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <Logo />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-1.5 rounded-full ${isActive(item.href)}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1.5 rounded-full text-gray-600 hover:bg-gray-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] p-0">
              <div className="flex flex-col h-full">
                <div className="px-6 py-4 border-b">
                  <Logo />
                </div>
                <div className="flex-1 px-2 py-4">
                  <div className="flex flex-col gap-1">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`w-full justify-start gap-3 ${item.active ? "bg-pink-50 text-pink-600" : ""}`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="border-t px-2 py-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start gap-3"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
} 