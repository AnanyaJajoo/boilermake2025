"use client"

import React from 'react'
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import PersonaForm from "./PersonaForm"

export default function CreatePersonaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/sign-in")
    return null
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50 pt-8 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container px-4 mx-auto">
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1 py-2 px-4 rounded-full text-indigo-600 bg-white shadow-sm hover:shadow-md transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </motion.div>
        
        <PersonaForm />
      </div>
    </motion.div>
  )
}
