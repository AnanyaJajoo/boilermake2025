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
import { CircularSpinner } from "@/components/ui/circular-spinner"

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

  // Card spring animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      } 
    }
  }

  // Button hover animation
  const buttonVariants = {
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(236, 72, 153, 0.1), 0 4px 6px -2px rgba(236, 72, 153, 0.05)"
    },
    tap: { 
      scale: 0.97 
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="w-full max-w-md space-y-8"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="text-center">
          <motion.div 
            className="mx-auto h-12 w-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 17,
              delay: 0.2
            }}
          >
            <Logo />
          </motion.div>
          <motion.h2 
            className="mt-6 text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Sign in to your account
          </motion.h2>
          <motion.p 
            className="mt-2 text-sm text-gray-600"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Or{" "}
            <Link href="/" className="font-medium text-pink-600 hover:text-pink-500 underline decoration-2 decoration-pink-500/30 underline-offset-2 transition-all">
              go back to the homepage
            </Link>
          </motion.p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Google Sign in */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-75 blur-sm group-hover:opacity-100 transition-all"></div>
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="relative w-full justify-center gap-2 bg-white text-gray-800 border-0 shadow-md hover:shadow-lg rounded-xl h-14"
              >
                {loading ? (
                  <CircularSpinner size="sm" variant="default" />
                ) : (
                  <FaGoogle className="text-red-500" />
                )}
                <span className="font-medium">{loading ? "Signing in..." : "Sign in with Google"}</span>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-3 rounded-full">Or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </motion.div>

          {/* Email Sign in */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-75 blur-sm"></div>
            <form onSubmit={handleEmailSignIn} className="relative bg-white rounded-xl p-6 shadow-md space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 shadow-sm bg-gray-50/80 focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all rounded-xl"
                    placeholder="Enter your email"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full justify-center bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90 h-12 rounded-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <CircularSpinner size="sm" variant="gradient" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    <span>Sign in with Email</span>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
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
          <CircularSpinner variant="gradient" label="Loading" />
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
} 