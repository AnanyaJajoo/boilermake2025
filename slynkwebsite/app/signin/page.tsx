"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaGoogle } from "react-icons/fa"
import { Mail } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

// Separate component that uses useSearchParams
function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }
    
    try {
      setLoading(true)
      
      // Check if we're in mock mode
      const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
      
      if (isMockMode) {
        // In mock mode, use credentials provider
        const result = await signIn("credentials", {
          email,
          redirect: false,
          callbackUrl,
        })
        
        if (result?.error) {
          toast({
            title: "Sign in failed",
            description: result.error,
            variant: "destructive",
          })
          return
        }
        
        router.push(callbackUrl)
      } else {
        // In real mode, use email provider
        const result = await signIn("email", {
          email,
          redirect: false,
          callbackUrl,
        })
        
        if (result?.error) {
          toast({
            title: "Sign in failed",
            description: result.error,
            variant: "destructive",
          })
          return
        }
        
        router.push("/check-email")
      }
    } catch (err) {
      console.error("Sign in error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      
      await signIn("google", {
        callbackUrl,
      })
    } catch (err) {
      console.error("Google sign in error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-auto">
            <Logo />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link href="/" className="font-medium text-pink-600 hover:text-pink-500">
              go back to the homepage
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Google Sign in */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-75 blur-sm"></div>
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="relative w-full justify-center gap-2 bg-white text-gray-800 border-0 shadow-md hover:shadow-lg rounded-lg h-12"
            >
              <FaGoogle className="text-red-500" />
              <span>Sign in with Google</span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Email Sign in */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-75 blur-sm"></div>
            <form onSubmit={handleEmailSignIn} className="relative bg-white rounded-lg p-4 shadow-md space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 shadow-sm bg-gray-50/80 focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90 h-12"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : (
                  <span>Sign in with Email</span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Main component with Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
          <p className="mt-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
} 