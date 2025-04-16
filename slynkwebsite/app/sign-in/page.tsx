"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { ArrowRight, Github, Twitter } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // This is where you would integrate with your auth service
      console.log("Sign in with:", email, password)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Left side - Form */}
      <div className="flex w-full flex-col items-center justify-center px-4 sm:w-1/2 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Logo />
            <motion.h2
              className="mt-6 text-3xl font-bold tracking-tight text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Sign in to your account
            </motion.h2>
            <motion.p
              className="mt-2 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Or{" "}
              <Link href="/sign-up" className="font-medium text-pink-500 hover:text-pink-600">
                create a new account
              </Link>
            </motion.p>
          </div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:border-pink-300 focus:ring-pink-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:border-pink-300 focus:ring-pink-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-pink-500 hover:text-pink-600">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <Button variant="outline" className="w-full">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden sm:block sm:w-1/2">
        <div className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100">
          {/* Animated circles */}
          <motion.div
            className="absolute h-64 w-64 rounded-full bg-gradient-to-r from-pink-300/20 to-purple-300/20 blur-xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute h-80 w-80 rounded-full bg-gradient-to-r from-blue-300/20 to-teal-300/20 blur-xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: 1,
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-md p-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-white p-3 shadow-lg">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 p-4">
                    <ArrowRight className="h-full w-full text-white" />
                  </div>
                </div>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-800">Start Your Journey</h3>
              <p className="text-gray-600">
                Sign in to create and manage your AI personas. Transform your brand communication with interactive
                virtual spokespersons.
              </p>
            </motion.div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V120Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
