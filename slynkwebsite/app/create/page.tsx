"use client"

import React, { useEffect } from 'react'
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from 'next/link'
import { ChevronLeft, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import PersonaForm from "./PersonaForm"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"

export default function CreatePersonaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated with useEffect to ensure it runs client-side
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/create")
    }
  }, [status, router])

  // Show loading or return null while checking authentication status
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-purple-200 mb-4"></div>
          <div className="h-4 w-32 bg-purple-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50">
      <DynamicNavbar />
      <div className="container mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Create AI Persona
            </motion.h1>
            
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-full border-2 border-gray-200 hover:border-gray-300">
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <PersonaForm />
        </div>
      </div>
    </div>
  )
}
