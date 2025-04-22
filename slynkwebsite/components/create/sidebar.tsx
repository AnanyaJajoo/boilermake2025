"use client"

import { useState } from "react"
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
import { PlusCircle, Search, User } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface AIPersona {
  id: string
  name: string
  dateCreated: string
}

interface CreateSidebarProps {
  setCurrentStep: (step: number) => void
}

export function CreateSidebar({ setCurrentStep }: CreateSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for AI personas
  const recentPersonas: AIPersona[] = [
    {
      id: "1",
      name: "Coca Cola - Product Specialist",
      dateCreated: "2023-04-15",
    },
    {
      id: "2",
      name: "Nike - Sales Representative",
      dateCreated: "2023-05-22",
    },
    {
      id: "3",
      name: "Lululemon - Sales Representative",
      dateCreated: "2023-06-10",
    },
    {
      id: "4",
      name: "CVS Pharmacy - Sales Representative",
      dateCreated: "2023-07-05",
    },
    {
      id: "5",
      name: "Tech Support Assistant",
      dateCreated: "2023-08-12",
    },
    {
      id: "6",
      name: "Sales Representative",
      dateCreated: "2023-09-18",
    },
  ]

  // Filter personas based on search query
  const filteredPersonas = recentPersonas.filter((persona) =>
    persona.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Sidebar className="w-64 border-r border-gray-200 bg-white" collapsible="none">
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between mb-3">
          <Logo />
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
              <User size={16} />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
        </div>
        <Button
          className="w-full gap-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90 rounded-full"
          size="sm"
          onClick={() => setCurrentStep(0)}
        >
          <PlusCircle size={16} />
          <span>New persona</span>
        </Button>
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
          {filteredPersonas.length > 0 ? (
            filteredPersonas.map((persona) => (
              <SidebarMenuItem key={persona.id}>
                <SidebarMenuButton 
                  className="rounded-md text-sm py-1.5 px-3 h-auto"
                  onClick={() => setCurrentStep(4)}
                >
                  <span className="truncate">{persona.name}</span>
                </SidebarMenuButton>
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
            VX
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">slynk AI</p>
            <p className="text-xs text-gray-500">Professional</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
