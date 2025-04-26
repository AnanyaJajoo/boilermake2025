"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Edit, MoreVertical, Trash2, Play, LogOut, Home, Users, MessageSquare, Pencil } from "lucide-react"
import { motion } from "framer-motion"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { Navbar } from "@/components/ui/navbar"

type Persona = {
  id: string
  name: string
  description: string
  createdAt: string
  faceId?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/dashboard")
    }

    if (status === "authenticated") {
      fetchPersonas()
    }
  }, [status, router])

  const fetchPersonas = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/personas")
      
      if (!response.ok) {
        throw new Error("Failed to fetch personas")
      }
      
      const data = await response.json()
      setPersonas(data.personas || [])
    } catch (error) {
      console.error("Error fetching personas:", error)
      toast({
        title: "Error",
        description: "Failed to load personas. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this persona?")) {
      return
    }

    try {
      const response = await fetch(`/api/personas/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete persona")
      }

      // Remove from list
      setPersonas(personas.filter(p => p.id !== id))
      
      toast({
        title: "Success",
        description: "Persona deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting persona:", error)
      toast({
        title: "Error",
        description: "Failed to delete persona. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  }

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-pink-500 animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600 font-medium">Loading your personas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 pt-24 pb-12">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your AI Personas</h1>
              <p className="text-gray-500 mt-1">Manage your digital personas</p>
            </div>

            <Link href="/create">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create New Persona
              </Button>
            </Link>
          </div>

          {personas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-lg bg-white">
              <div className="text-center mb-6">
                <h2 className="text-xl font-medium text-gray-900 mb-2">No personas created yet</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Create your first AI persona to start having conversations and engaging with your audience.
                </p>
              </div>
              
              <Link href="/create">
                <Button className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Create First Persona
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map((persona) => (
                <div key={persona.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium text-lg text-gray-900 group-hover:text-pink-600 transition-colors">
                        {persona.name}
                      </h3>
                      <div className="flex gap-2">
                        <Link href={`/edit/${persona.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-full"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                          onClick={() => handleDelete(persona.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {persona.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between">
                      <Link href={`/chat/${persona.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-pink-600 border-pink-100 hover:bg-pink-50">
                          <Play className="h-3 w-3" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Personalized Ad Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AdRecommendation 
                title="Beauty Brand Marketing"
                description="Create a friendly beauty advisor to guide customers through your product catalog and offer personalized recommendations."
                industry="Beauty & Cosmetics"
                conversionRate="+32%"
              />
              <AdRecommendation 
                title="Financial Advisor Bot"
                description="Deploy an AI financial advisor to help clients understand your services and products while answering common questions."
                industry="Financial Services"
                conversionRate="+24%"
              />
              <AdRecommendation 
                title="E-commerce Assistant"
                description="Boost your sales with a shopping assistant that helps customers find products and complete purchases."
                industry="E-commerce"
                conversionRate="+28%"
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-8 px-4 mt-12 border-t border-gray-100 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl text-center text-gray-500 text-sm">
          <p>Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600 font-medium">Slynk AI</span> &copy; {new Date().getFullYear()}</p>
          <p className="mt-1 text-xs text-gray-400">Create, deploy, and analyze AI personas for your business</p>
        </div>
      </footer>
    </div>
  )
}

interface AdRecommendationProps {
  title: string;
  description: string;
  industry: string;
  conversionRate: string;
}

function AdRecommendation({ title, description, industry, conversionRate }: AdRecommendationProps) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-all">
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <span className="text-xs font-medium bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
            {industry}
          </span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm flex-grow mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Conversion {conversionRate}
          </span>
          <Link href="/create">
            <Button variant="outline" size="sm" className="gap-1 text-pink-600 border-pink-100 hover:bg-pink-50">
              <Plus className="h-3 w-3" />
              Create
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 