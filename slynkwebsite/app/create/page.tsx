"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import PersonaForm from "./PersonaForm"

export default function CreatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])
  
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated (redirect is handled by useEffect)
  if (status === "unauthenticated") {
        return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto max-w-4xl px-4 pt-24 pb-12">
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
            <CardTitle className="text-2xl">Create New Persona</CardTitle>
            <CardDescription>
              Define the personality, appearance, and behavior of your AI persona
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <PersonaForm />
          </CardContent>
        </Card>
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
