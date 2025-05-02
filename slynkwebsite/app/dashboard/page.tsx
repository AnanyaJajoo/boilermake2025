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
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { CircularSpinner } from "@/components/ui/circular-spinner"

type Persona = {
  id: string
  name: string
  description: string
  createdAt: string
  faceId?: string
}

// Card animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24,
      delay: 0.05 * i 
    } 
  })
};

// Button hover animation
const buttonVariants = {
  hover: { 
    scale: 1.03,
    boxShadow: "0 10px 15px -3px rgba(236, 72, 153, 0.1), 0 4px 6px -2px rgba(236, 72, 153, 0.05)"
  },
  tap: { 
    scale: 0.97 
  }
};

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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          <CircularSpinner size="lg" variant="gradient" label="Loading your personas..." />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-gray-50 to-purple-50/50">
      <DynamicNavbar />
      <main className="container mx-auto max-w-6xl px-4 pt-24 pb-12">
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Your AI Personas</h1>
              <p className="text-gray-500 mt-1">Manage your digital personas</p>
            </div>

            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <Link href="/create">
                <Button className="gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 border-0 text-white shadow-md hover:shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all">
                  <Plus className="h-4 w-4" />
                  Create New Persona
                </Button>
              </Link>
            </motion.div>
          </div>

          {personas.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-2xl bg-white shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 24,
                delay: 0.2
              }}
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-medium text-gray-900 mb-2">No personas created yet</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Create your first AI persona to start having conversations and engaging with your audience.
                </p>
              </div>
              
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
              >
                <Link href="/create">
                  <Button className="gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 border-0 text-white shadow-md hover:shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all">
                    <Plus className="h-4 w-4" />
                    Create First Persona
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map((persona, i) => (
                <motion.div 
                  key={persona.id} 
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                  }}
                  className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm transition-all"
                >
                  {/* Subtle gradient border effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 -z-10 transition-opacity"></div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium text-lg text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-600 transition-colors">
                        {persona.name}
                      </h3>
                      <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                            onClick={() => handleDelete(persona.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {persona.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between">
                      <motion.div
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                      >
                        <Link href={`/chat/${persona.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 text-pink-600 border-pink-100 hover:bg-pink-50 rounded-xl">
                            <Play className="h-3 w-3" />
                            Chat
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Personalized Ad Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AdRecommendation 
                title="Beauty Brand Marketing"
                description="Create a friendly beauty advisor to guide customers through your product catalog and offer personalized recommendations."
                industry="Beauty & Cosmetics"
                conversionRate="+32%"
                index={0}
              />
              <AdRecommendation 
                title="Financial Advisor Bot"
                description="Deploy an AI financial advisor to help clients understand your services and products while answering common questions."
                industry="Financial Services"
                conversionRate="+24%"
                index={1}
              />
              <AdRecommendation 
                title="E-commerce Assistant"
                description="Boost your sales with a shopping assistant that helps customers find products and complete purchases."
                industry="E-commerce"
                conversionRate="+28%"
                index={2}
              />
            </div>
          </motion.div>
        </motion.div>
      </main>
      
      <motion.footer 
        className="py-8 px-4 mt-12 border-t border-gray-100 bg-white/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto max-w-6xl text-center text-gray-500 text-sm">
          <p>Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600 font-medium">Slynk AI</span> &copy; {new Date().getFullYear()}</p>
          <p className="mt-1 text-xs text-gray-400">Create, deploy, and analyze AI personas for your business</p>
        </div>
      </motion.footer>
    </div>
  )
}

interface AdRecommendationProps {
  title: string;
  description: string;
  industry: string;
  conversionRate: string;
  index: number;
}

function AdRecommendation({ title, description, industry, conversionRate, index }: AdRecommendationProps) {
  return (
    <motion.div 
      className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all overflow-hidden relative"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      custom={index}
      whileHover={{ 
        y: -3, 
        boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
      }}
    >
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-bl-full -mr-10 -mt-10"></div>
      
      <div className="flex flex-col h-full relative z-10">
        <div className="mb-2">
          <span className="text-xs font-medium bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
            {industry}
          </span>
          
          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
            {conversionRate}
          </span>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-4">{description}</p>
        
        <div className="mt-auto pt-2">
          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="text-pink-600 border-pink-100 hover:bg-pink-50 rounded-xl"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 