"use client"

import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"

interface AIPersona {
  id: string
  name: string
  createdAt: string
}

export function CreateSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    // Only fetch personas if user is authenticated
    if (session?.user) {
      fetchPersonas()
    }
  }, [session])

  // Function to fetch personas from the API
  const fetchPersonas = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/personas")
      
      if (!response.ok) {
        throw new Error(`Failed to fetch personas: ${response.status}`)
      }
      
      const data = await response.json()
      setPersonas(data)
    } catch (error) {
      console.error("Error fetching personas:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter personas based on search query
  const filteredPersonas = personas.filter((persona) =>
    persona.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Sidebar className="w-64 border-r border-gray-200 bg-white" collapsible="none">
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between mb-3">
          <Logo />
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
              <User size={16} />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
        </div>
        <Link href="/create">
        <Button
          className="w-full gap-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90 rounded-full"
          size="sm"
        >
          <PlusCircle size={16} />
          <span>New persona</span>
        </Button>
        </Link>
        <div className="relative mt-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search personas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm rounded-md"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <div className="px-3 py-1">
          <h3 className="text-xs font-medium text-gray-500 mb-2">Recent Personas</h3>
        </div>
        <SidebarMenu>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
            </div>
          ) : filteredPersonas.length > 0 ? (
            filteredPersonas.map((persona) => (
              <SidebarMenuItem key={persona.id}>
                <Link href={`/edit/${persona.id}`} className="w-full">
                  <SidebarMenuButton className="rounded-md text-sm py-1.5 px-3 h-auto w-full text-left">
                  <span className="truncate">{persona.name}</span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {new Date(persona.createdAt).toLocaleDateString()}
                    </span>
                </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))
          ) : (
            <div className="text-xs text-gray-500 text-center py-2 px-3">No personas found</div>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium text-sm">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
