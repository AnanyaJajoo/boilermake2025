"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShineBorder } from "@/components/ui/shine-border"
import { Mail } from "lucide-react"
import Image from "next/image"
import { AnimatedText } from "@/components/animated-text"
import { toast } from "@/components/ui/use-toast"
import { AnimatedEmojiBackground } from "@/components/animated-emoji-background"
import { motion } from "framer-motion"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Submit to our API endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit')
      }
      
      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll notify you when we launch!",
        variant: "default",
      })
      
      setEmail("")
    } catch (error) {
      console.error("Error submitting to waitlist:", error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error adding you to the waitlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-screen pt-32 pb-16 overflow-hidden bg-white">
      <AnimatedEmojiBackground />

      <ShineBorder className="relative z-10 max-w-6xl mx-auto px-6" borderClassName="rounded-xl overflow-hidden">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-900">
            Bring Your{" "}
            <span className="relative">
              <span className="animate-pulse-glow bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">
                <AnimatedText words={["Brand", "Ads", "Conference"]} typingSpeed={120} deletingSpeed={80} />
              </span>
              <span className="absolute -inset-1 bg-pink-400/20 blur-lg rounded-lg animate-pulse-slow"></span>
            </span>{" "}
            to Life
            <br />
            with AI personas
          </h1>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Transform static advertisements into engaging, conversational experiences. Upload your content and let our
            AI-driven avatars tell your story.
          </p>
          
          {/* Animated Gradient Border */}
          <div className="relative max-w-2xl mx-auto">
            {/* Animated gradient border */}
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-75 blur-sm animate-border-flow"></div>
            
            {/* Waitlist Form */}
            <form onSubmit={handleWaitlistSubmit} className="relative flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-1">
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-12 h-14 text-base rounded-lg border-none shadow-inner bg-gray-50/80 focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="h-14 px-8 text-base font-medium bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90 rounded-lg transition-transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Join Waitlist"}
              </Button>
            </form>
          </div>
          
          {/* Original buttons (commented out) */}
          {/*
          <div className="flex gap-4 justify-center relative z-20">
            <Button
              variant="outline"
              className="gap-2 border-pink-200 hover:bg-pink-50 text-pink-600"
              onClick={() => window.open("#demo", "_self")}
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
            <Link href="/create" className="z-20">
              <Button className="bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
          */}
        </div>

        <ShineBorder className="relative mx-auto" borderClassName="rounded-xl overflow-hidden pink-glow">
          <div className="relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero%20image.jpg-mE5vAT4d864MlVhdkcrk1Vn2WcNONq.jpeg"
              alt="Background Gradient"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
            <div className="absolute inset-0 flex items-end justify-center pb-16">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl w-[90%] h-[70%] flex shadow-lg">
                <div className="flex-1 pr-2">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Browser-HZNDOssbyLixIa4lABR27yelWXveQ0.png"
                    alt="Browser Preview"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover rounded-lg"
                    priority
                  />
                </div>
                <div className="flex-1 pl-2">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Editor%20Window-sJ4sXlXpgDhv7gLvQylqH5VTb3L0rc.png"
                    alt="Code Editor"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover rounded-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </ShineBorder>
      </ShineBorder>
    </section>
  )
}
